"""
Document generation service using docxtpl for creating internship and offer letters.
"""
from docxtpl import DocxTemplate
from datetime import date, datetime
from pathlib import Path
from typing import Dict, Optional
import os


class DocumentService:
    """Service for generating documents from Word templates."""
    
    def __init__(self):
        """Initialize the document service with template paths."""
        self.base_path = Path(__file__).parent.parent.parent / "documents"
        self.internship_template = self.base_path / "Internship_Letter_Wissen.docx"
        self.offer_template = self.base_path / "Offer_Letter_wissen.docx"
        self.output_path = self.base_path / "generated"
        
        # Create output directory if it doesn't exist
        self.output_path.mkdir(exist_ok=True)
    
    def _format_date(self, date_obj: Optional[date]) -> str:
        """Format date object to string format."""
        if date_obj is None:
            return ""
        if isinstance(date_obj, str):
            return date_obj
        return date_obj.strftime("%B %d, %Y")  # e.g., "January 15, 2024"
    
    def _extract_first_name(self, full_name: str) -> str:
        """Extract first name from full name."""
        if not full_name:
            return ""
        return full_name.split()[0]
    
    def _get_salutation(self,gender: str) ->str:
        if not gender:
            return ""
        
        if gender == "MALE":
            return "Mr. "
        elif gender == "FEMALE":
            return "Ms. "
        else:
            return ""
    
    def _calculate_months(self, start_date: Optional[date], end_date: Optional[date]) -> str:
        """
        Calculate number of months between start and end date.
        
        Args:
            start_date: Start date
            end_date: End date
        
        Returns:
            Number of months as string
        """
        if not start_date or not end_date:
            return ""
        
        # Convert string dates to date objects if needed
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        
        # Calculate difference in months
        months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
        
        # Adjust for partial months
        if end_date.day < start_date.day:
            months -= 1
        
        return str(months)
    

    
    def _prepare_context(
        self,
        full_name: str,
        gender: Optional[str] = None,
        address: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        deadline_date: Optional[date] = None,
        job_position: Optional[str] = None,
        **kwargs
    ) -> Dict[str, str]:
        """
        Prepare context dictionary for template rendering.
        
        Args:
            full_name: Full name of the intern
            gender: Gender of the intern (MALE/FEMALE)
            address: Address of the intern
            start_date: Internship start date
            end_date: Internship end date
            deadline_date: Application/acceptance deadline
            job_position: Job position/role title
            **kwargs: Additional custom placeholders
        
        Returns:
            Dictionary with all template placeholders
        """

        salutation = self._get_salutation(gender)
        
        context = {
            "NAME": salutation + (full_name or ""),
            "FIRST_NAME": salutation + (self._extract_first_name(full_name or "")),
            "ADDRESS": address or "",
            "DATE": self._format_date(date.today()),
            "JOB_POSITION": job_position or "Intern",
            "START_DATE": self._format_date(start_date),
            "END_DATE": self._format_date(end_date),
            "DEAD_LINE_DATE": self._format_date(deadline_date),
            "MONTHS": self._calculate_months(start_date, end_date),
        }
        
        # Add any additional custom placeholders
        context.update(kwargs)
        
        return context
    
    def generate_internship_letter(
        self,
        intern_data: Dict,
        output_filename: Optional[str] = None
    ) -> str:
        """
        Generate an internship letter from template.
        
        Args:
            intern_data: Dictionary containing intern information
            output_filename: Optional custom output filename
        
        Returns:
            Path to the generated document
        
        Raises:
            FileNotFoundError: If template file doesn't exist
        """
        if not self.internship_template.exists():
            raise FileNotFoundError(
                f"Internship letter template not found at {self.internship_template}"
            )
        
        # Prepare context from intern data
        context = self._prepare_context(**intern_data)
        
        # Load template
        doc = DocxTemplate(self.internship_template)
        
        # Render template with context
        doc.render(context)
        
        # Generate output filename if not provided
        if not output_filename:
            intern_name = intern_data.get("full_name", "Unknown").replace(" ", "_")
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"Internship_Letter_{intern_name}_{timestamp}.docx"
        
        # Save the generated document
        output_path = self.output_path / output_filename
        doc.save(output_path)
        
        return str(output_path)
    
    def generate_offer_letter(
        self,
        intern_data: Dict,
        output_filename: Optional[str] = None
    ) -> str:
        """
        Generate an offer letter from template.
        
        Args:
            intern_data: Dictionary containing intern information
            output_filename: Optional custom output filename
        
        Returns:
            Path to the generated document
        
        Raises:
            FileNotFoundError: If template file doesn't exist
        """
        if not self.offer_template.exists():
            raise FileNotFoundError(
                f"Offer letter template not found at {self.offer_template}"
            )
        
        # Prepare context from intern data
        context = self._prepare_context(**intern_data)
        
        # Load template
        doc = DocxTemplate(self.offer_template)
        
        # Render template with context
        doc.render(context)
        
        # Generate output filename if not provided
        if not output_filename:
            intern_name = intern_data.get("full_name", "Unknown").replace(" ", "_")
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"Offer_Letter_{intern_name}_{timestamp}.docx"
        
        # Save the generated document
        output_path = self.output_path / output_filename
        doc.save(output_path)
        
        return str(output_path)
    
    def generate_both_letters(
        self,
        intern_data: Dict
    ) -> Dict[str, str]:
        """
        Generate both internship and offer letters for an intern.
        
        Args:
            intern_data: Dictionary containing intern information
        
        Returns:
            Dictionary with paths to both generated documents
        """
        internship_letter_path = self.generate_internship_letter(intern_data)
        offer_letter_path = self.generate_offer_letter(intern_data)
        
        return {
            "internship_letter": internship_letter_path,
            "offer_letter": offer_letter_path
        }


# Create a singleton instance
document_service = DocumentService()


# Convenience functions for easy import
def generate_internship_letter(intern_data: Dict, output_filename: Optional[str] = None) -> str:
    """Generate an internship letter."""
    return document_service.generate_internship_letter(intern_data, output_filename)


def generate_offer_letter(intern_data: Dict, output_filename: Optional[str] = None) -> str:
    """Generate an offer letter."""
    return document_service.generate_offer_letter(intern_data, output_filename)


def generate_both_letters(intern_data: Dict) -> Dict[str, str]:
    """Generate both internship and offer letters."""
    return document_service.generate_both_letters(intern_data)
