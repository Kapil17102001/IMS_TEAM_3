from typing import Dict, List
import pdfplumber
import logging
import os
import json
from openai import OpenAI
from app.core.config import settings
from app.db.session import SessionLocal
from app.services.candidate_service import CandidateService
from app.schemas.candidate import CandidateCreate
from app.models.enums import RoundName
from datetime import date

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PDFExtractionService:
    BASE_RESUME_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "documents", "resume")

    def __init__(self):
        # Initialize OpenAI client with API key from config
        self.llm_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.candidate_service = CandidateService()

    def extract_and_process_resumes(self) -> Dict[str, str]:
        """
        Extract text from all PDF files in backend/documents/resume,
        process each using LLM to extract candidate information,
        and save to the database.

        :return: Dictionary mapping filename -> status (success/error message)
        """
        results: Dict[str, str] = {}

        # Check if resume directory exists
        if not os.path.exists(self.BASE_RESUME_PATH):
            logger.error(f"Resume directory does not exist: {self.BASE_RESUME_PATH}")
            return {"error": f"Directory {self.BASE_RESUME_PATH} not found"}

        # Get all PDF files
        pdf_files = [
            f for f in os.listdir(self.BASE_RESUME_PATH)
            if f.lower().endswith(".pdf")
        ]

        if not pdf_files:
            logger.warning("No PDF files found in resume directory.")
            return {"warning": "No PDF files found"}

        logger.info(f"Found {len(pdf_files)} PDF files to process")

        # Create database session
        db = SessionLocal()

        try:
            for filename in pdf_files:
                file_path = os.path.join(self.BASE_RESUME_PATH, filename)
                logger.info(f"Processing: {filename}")

                try:
                    # Extract text from PDF using pdfplumber
                    extracted_text = self._extract_text_from_pdf(file_path)

                    if not extracted_text:
                        results[filename] = "Failed: No text extracted"
                        logger.warning(f"No text extracted from {filename}")
                        continue

                    # Process with LLM to extract candidate information
                    candidate_data = self._process_with_llm(extracted_text)

                    if not candidate_data:
                        results[filename] = "Failed: LLM processing error"
                        logger.error(f"LLM failed to process {filename}")
                        continue

                    # Check if candidate already exists by email
                    if candidate_data.get("email"):
                        existing = self.candidate_service.get_candidate_by_email(
                            db, candidate_data["email"]
                        )
                        if existing:
                            results[filename] = f"Skipped: Email {candidate_data['email']} already exists"
                            logger.info(f"Candidate with email {candidate_data['email']} already exists")
                            continue

                    # Add resume name to candidate data
                    candidate_data["resume_name"] = filename

                    # Add new fields to candidate data
                    candidate_data["application_date"] = str(date.today())
                    candidate_data["source"] = "college"

                    # Extract skills from LLM response
                    candidate_data["skills"] = candidate_data.get("skills", "")

                    # Create candidate schema object
                    candidate_create = CandidateCreate(**candidate_data)

                    # Save to database
                    new_candidate = self.candidate_service.create_candidate(
                        db, candidate_create
                    )

                    results[filename] = f"Success: Created candidate ID {new_candidate.id}"
                    logger.info(f"Successfully created candidate from {filename}")

                except Exception as e:
                    results[filename] = f"Error: {str(e)}"
                    logger.error(f"Failed to process {filename}: {str(e)}", exc_info=True)

        finally:
            db.close()

        return results

    def _extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extract text from a PDF file using pdfplumber.

        :param file_path: Path to the PDF file
        :return: Extracted text as a string
        """
        full_text = []

        try:
            with pdfplumber.open(file_path) as pdf:
                for page_number, page in enumerate(pdf.pages, start=1):
                    text = page.extract_text()
                    if text:
                        full_text.append(text)
                        logger.debug(f"Extracted text from page {page_number}")

            return "\n".join(full_text) if full_text else ""

        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            raise

    def _process_with_llm(self, resume_text: str) -> dict:
        """
        Process resume text using OpenAI GPT-4.1-mini to extract candidate information, including skills.

        :param resume_text: Extracted text from resume
        :return: Dictionary with candidate information matching Candidate schema
        """
        try:
            # Update the prompt to request skills as a single string
            prompt = f"""
Extract candidate information from the following resume text and return it in JSON format.

Required fields:
- full_name (string): The candidate's full name
- email (string): The candidate's email address
- university (string, optional): The university/educational institution
- address (string, optional): The candidate's location/address
- status (string): Set to "pending" by default
- skills (string): Comma-separated string of skills mentioned in the resume

Resume text:
{resume_text}

Return ONLY a valid JSON object with the extracted information. If a field is not found, use null for optional fields.
Example format:
{{
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "university": "Example University",
    "address": "City, Country",
    "status": "pending",
    "skills": "Python, Java, Docker, etc"
}}
"""

            # Call OpenAI API
            response = self.llm_client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at extracting structured information from resumes. Return only valid JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            # Extract and parse the response
            content = response.choices[0].message.content
            candidate_data = json.loads(content)

            # Ensure required fields and set defaults
            if not candidate_data.get("full_name"):
                raise ValueError("LLM failed to extract full_name")
            if not candidate_data.get("email"):
                raise ValueError("LLM failed to extract email")

            # Ensure status is set to pending
            candidate_data["status"] = RoundName.PENDING

            # Ensure skills is a string
            if "skills" in candidate_data and isinstance(candidate_data["skills"], list):
                candidate_data["skills"] = ", ".join(candidate_data["skills"])

            logger.info(f"LLM extracted candidate: {candidate_data.get('full_name')} with skills: {candidate_data.get('skills')}")
            return candidate_data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {str(e)}")
            return {}
        except Exception as e:
            logger.error(f"LLM processing error: {str(e)}")
            return {}


    def _extract_skills_from_resume(self, resume_text: str) -> str:
        """
        Extract skills from the resume text.

        :param resume_text: Extracted text from resume
        :return: Comma-separated string of skills
        """
        # Example: Define a list of skills to search for in the resume
        predefined_skills = ["Python", "Java", "SQL", "Machine Learning", "Data Analysis", "Communication"]
        extracted_skills = []

        for skill in predefined_skills:
            if skill.lower() in resume_text.lower():
                extracted_skills.append(skill)

        return ", ".join(extracted_skills)

# Create singleton instance
pdf_extraction_service = PDFExtractionService()