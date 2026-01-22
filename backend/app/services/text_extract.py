from typing import Dict, Optional
import pdfplumber
import logging
import os


class PDFExtractionService:
    BASE_RESUME_PATH = "backend/documents/resume"

    def extract_text(self) -> Dict[str, Optional[str]]:
        """
        Extract text from all PDF files present in backend/documents/resume.

        :return: Dictionary mapping filename -> extracted text (or None if failed)
        """
        extracted_data: Dict[str, Optional[str]] = {}

        if not os.path.exists(self.BASE_RESUME_PATH):
            logging.error(
                f"Resume directory does not exist: {self.BASE_RESUME_PATH}"
            )
            return extracted_data

        pdf_files = [
            f for f in os.listdir(self.BASE_RESUME_PATH)
            if f.lower().endswith(".pdf")
        ]

        if not pdf_files:
            logging.warning("No PDF files found in resume directory.")
            return extracted_data

        for filename in pdf_files:
            file_path = os.path.join(self.BASE_RESUME_PATH, filename)

            try:
                full_text = []

                with pdfplumber.open(file_path) as pdf:
                    for page_number, page in enumerate(pdf.pages, start=1):
                        text = page.extract_text()
                        if text:
                            full_text.append(text)

                extracted_data[filename] = (
                    "\n".join(full_text) if full_text else None
                )

            except Exception as e:
                logging.error(
                    f"Failed to extract text from '{filename}': {str(e)}"
                )
                extracted_data[filename] = None
        
        print(extracted_data)

        return extracted_data


pdf_extraction_service = PDFExtractionService()
