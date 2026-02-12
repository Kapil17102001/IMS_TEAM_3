from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.intern import Intern, InternCreate, InternUpdate
from app.services.intern_service import intern_service
from app.services.document_service import generate_internship_letter,generate_offer_letter
from datetime import date, datetime
from app.services.email_service import email_service
import secrets
import string
from app.models.user import User, UserRole
from app.services.user_service import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[Intern])
def read_interns(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all interns with pagination.
    """
    return intern_service.get_interns(db, skip=skip, limit=limit)

@router.post("/", response_model=Intern, status_code=status.HTTP_201_CREATED)
async def create_intern(
    *,
    db: Session = Depends(deps.get_db),
    intern_in: InternCreate
) -> Any:
    """
    Create a new intern during onboarding.
    """
    db_intern = intern_service.get_intern_by_email(db, email=intern_in.email)
    if db_intern:
        raise HTTPException(
            status_code=400,
            detail="An intern with this email already exists in the system."
        )
    created_intern =  intern_service.create_intern(db=db, intern_in=intern_in)

    # If linked to a candidate, update candidate status to ONBOARDED
    if intern_in.candidate_id:
        from app.models.candidate import Candidate
        from app.models.enums import RoundName
        candidate = db.query(Candidate).filter(Candidate.id == intern_in.candidate_id).first()
        if candidate:
            candidate.status = RoundName.ONBOARDED
            db.add(candidate)
            db.commit()

    intern_data = {
         "full_name": created_intern.full_name,
         "email":intern_in.email,
        "gender": created_intern.gender,
        "address": created_intern.address,
        "start_date": created_intern.start_date,
        "end_date": created_intern.end_date,
        "deadline_date": date.today() ,
        "salary": created_intern.salary or "25,000",
        "job_position": created_intern.job_position,
    }

    # Generate secure random password
    alphabet = string.ascii_letters + string.digits
    raw_password = ''.join(secrets.choice(alphabet) for i in range(12))
    
    # Create User for the Intern
    # Generate a unique username based on name
    base_username = created_intern.full_name.replace(" ", "_").lower()
    unique_username = f"{base_username}_{secrets.token_hex(2)}"
    
    new_user = User(
        username=unique_username,
        email=created_intern.email,
        hashed_password=get_password_hash(raw_password),
        role=UserRole.INTERN,
        intern_id=created_intern.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    try:
        generate_offer = generate_offer_letter(intern_data)
        generate_internship = generate_internship_letter(intern_data)

        email_html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; rounded: 10px;">
            <h2 style="color: #2563eb;">Welcome to the Team, {created_intern.full_name}!</h2>
            <p>Congratulations on your internship. We are excited to have you on board.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; font-size: 16px;">Step 1: Your Account Access</h3>
                <p style="margin-bottom: 5px;">Your portal account has been created. Please use the following credentials to log in:</p>
                <p><strong>Email:</strong> {created_intern.email}</p>
                <p><strong>Password:</strong> <span style="font-family: monospace; background: #fff; padding: 2px 5px; border: 1px solid #ccc;">{raw_password}</span></p>
            </div>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; font-size: 16px;">Step 2: Document Verification</h3>
                <p>Please log in to the portal and upload the following documents for verification:</p>
                <ul style="font-size: 14px;">
                    <li>Aadhar Card</li>
                    <li>PAN Card</li>
                    <li>Matriculation Certificate</li>
                    <li>Intermediate Certificate</li>
                    <li>Degree Certificate</li>
                </ul>
            </div>

            <p style="font-size: 14px; color: #666;">Attached to this email are your official <strong>Offer Letter</strong> and <strong>Internship Letter</strong>.</p>
            
            <p>Best Regards,<br>HR Team</p>
        </div>
        """

        await email_service.send_email(
            email_to=[intern_in.email],
            subject=f"Congratulations! Your Onboarding is in Progress - {created_intern.full_name}",
            html_content=email_html,
            attachments=[generate_offer, generate_internship]
        )
    
    except Exception as e :
        print(f"Warning: Failed to generate document or send email: {str(e)}")



    return created_intern

@router.get("/{intern_id}", response_model=Intern)
def read_intern_by_id(
    intern_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get a specific intern by ID.
    """
    db_intern = intern_service.get_intern_by_id(db, intern_id=intern_id)
    if not db_intern:
        raise HTTPException(
            status_code=404,
            detail="Intern not found"
        )
    return db_intern

@router.put("/{intern_id}", response_model=Intern)
def update_intern(
    *,
    db: Session = Depends(deps.get_db),
    intern_id: int,
    intern_in: InternUpdate
) -> Any:
    """
    Update an intern's information.
    """
    db_intern = intern_service.get_intern_by_id(db, intern_id=intern_id)
    if not db_intern:
        raise HTTPException(
            status_code=404,
            detail="Intern not found"
        )
    return intern_service.update_intern(db=db, db_intern=db_intern, intern_in=intern_in)

@router.delete("/{intern_id}", response_model=Intern)
def delete_intern(
    *,
    db: Session = Depends(deps.get_db),
    intern_id: int
) -> Any:
    """
    Remove an intern from the system.
    """
    db_intern = intern_service.get_intern_by_id(db, intern_id=intern_id)
    if not db_intern:
        raise HTTPException(
            status_code=404,
            detail="Intern not found"
        )
    return intern_service.delete_intern(db=db, intern_id=intern_id)
