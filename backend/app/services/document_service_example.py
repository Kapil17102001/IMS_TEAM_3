"""
Example usage of the document_service.py

This file demonstrates how to use the document service to generate 
internship and offer letters for new interns.
"""
from datetime import date
# from app.services.document_service import (
#     generate_internship_letter,
#     generate_offer_letter,
#     generate_both_letters
# )
from document_service import (
    generate_internship_letter,
    generate_offer_letter,
    generate_both_letters
)


def example_generate_letters():
    """Example: Generate letters for a new intern."""
    
    # Prepare intern data
    intern_data = {
        "full_name": "Kapil Dev Saini",
        "start_date": date(2024, 2, 1),
        "end_date": date(2024, 7, 31),
        "deadline_date": date(2024, 1, 25),
        "salary": "25,000/month",
        "job_position": "Software Engineering Intern",
    }
    
    # Option 1: Generate only internship letter
    internship_path = generate_internship_letter(intern_data)
    print(f"Internship letter generated: {internship_path}")
    
    # Option 2: Generate only offer letter
    offer_path = generate_offer_letter(intern_data)
    print(f"Offer letter generated: {offer_path}")
    
    # Option 3: Generate both letters at once
    paths = generate_both_letters(intern_data)
    print(f"Internship letter: {paths['internship_letter']}")
    print(f"Offer letter: {paths['offer_letter']}")


def example_with_custom_filename():
    """Example: Generate letter with custom filename."""
    
    intern_data = {
        "full_name": "Jane Smith",
        "start_date": date(2024, 3, 1),
        "end_date": date(2024, 8, 31),
        "salary": "2,500",
        "job_position": "Data Science Intern"
    }
    
    # Generate with custom filename
    custom_path = generate_offer_letter(
        intern_data,
        output_filename="Jane_Smith_Offer_2024.docx"
    )
    print(f"Offer letter generated with custom name: {custom_path}")


def example_with_additional_placeholders():
    """Example: Include additional custom placeholders."""
    
    intern_data = {
        "full_name": "Mike Johnson",
        "start_date": date(2024, 2, 15),
        "end_date": date(2024, 8, 15),
        "salary": "$1,800/month",
        "job_position": "Marketing Intern",
        # Additional custom placeholders (if your template has them)
        "DEPARTMENT": "Marketing & Communications",
        "SUPERVISOR": "Sarah Williams",
        "WORK_HOURS": "40 hours per week"
    }
    
    paths = generate_both_letters(intern_data)
    print(f"Letters generated with additional data: {paths}")


def example_from_database_model():
    """Example: Generate letters from database model (pseudo-code)."""
    
    # Assuming you have an Intern model instance from database
    # intern = db.query(Intern).filter(Intern.id == intern_id).first()
    
    # Convert model to dictionary for document generation
    intern_data = {
        "full_name": "intern.full_name",  # Replace with actual model attribute
        "start_date": "intern.start_date",
        "end_date": "intern.end_date",
        "deadline_date": date.today(),  # Or calculate based on your logic
        "salary": "$2,000/month",  # This might come from another field
        "job_position": "intern.department + ' Intern'",  # Or from another field
    }
    
    paths = generate_both_letters(intern_data)
    return paths


if __name__ == "__main__":
    # Run examples
    print("=== Example 1: Generate both letters ===")
    example_generate_letters()
    
    print("\n=== Example 2: Custom filename ===")
    example_with_custom_filename()
    
    print("\n=== Example 3: Additional placeholders ===")
    example_with_additional_placeholders()
