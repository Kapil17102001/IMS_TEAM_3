from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.college import College, CollegeCreate, CollegeUpdate
from app.services.college_service import college_service
from app.services.email_service import email_service

router = APIRouter()

@router.get("/", response_model=List[College])
def read_colleges(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all colleges with pagination.
    """
    return college_service.get_colleges(db, skip=skip, limit=limit)

@router.post("/", response_model=College, status_code=status.HTTP_201_CREATED)
async def create_college(
    *,
    db: Session = Depends(deps.get_db),
    college_in: CollegeCreate
) -> Any:
    """
    Create a new college and send an email to the college.
    """
    db_college = college_service.get_college_by_email(db, email=college_in.email)
    if db_college:
        raise HTTPException(
            status_code=400,
            detail="A college with this email already exists."
        )

    try:
        # Create the college in the database
        new_college = college_service.create_college(db=db, college_in=college_in)

        # Send email to the college
        email_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .greeting {{ margin-bottom: 20px; }}
                .content {{ margin-bottom: 15px; }}
                ul {{ margin: 15px 0; padding-left: 25px; }}
                li {{ margin: 8px 0; }}
                .signature {{ margin-top: 30px; }}
                .signature p {{ margin: 5px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="greeting">
                    <p>Dear {college_in.college_name},</p>
                </div>
                
                <div class="content">
                    <p>Greetings from <strong>Wissen Technology</strong>.</p>
                </div>
                
                <div class="content">
                    <p>We are planning to conduct a recruitment drive and would like to invite your institution to participate in our hiring process.</p>
                </div>
                
                <div class="content">
                    <p>To proceed, we request the placement team to sign up on our hiring portal: <strong>WWW.wissen.com</strong>. Once registered, you will be able to:</p>
                    <ul>
                        <li>Shortlist 100 eligible students as per your internal criteria</li>
                        <li>Upload the resumes of the shortlisted students on our portal</li>
                        <li>Enable us to schedule and conduct interviews for the selected candidates</li>
                    </ul>
                </div>
                
                <div class="content">
                    <p>After the resumes are uploaded, our hiring team will review the profiles and share the next steps regarding interview timelines.</p>
                </div>
                
                <div class="content">
                    <p>For any queries or assistance, please feel free to reach out to us at <strong>www.wissen.com</strong>.</p>
                </div>
                
                <div class="content">
                    <p>We look forward to collaborating with your institution.</p>
                </div>
                
                <div class="signature">
                    <p>Warm regards,</p>
                    <p><strong>Abhay</strong><br>
                    Senior Software Engineer<br>
                    Wissen Technology<br>
                    +91 0000000</p>
                </div>
            </div>
        </body>
        </html>
        """

        await email_service.send_email(
            email_to=[college_in.email],
            subject="Invitation to Participate in Recruitment Drive",
            html_content=email_body
        )

    except Exception as e:
        print(f"Warning: Failed to send email: {str(e)}")

    return new_college

@router.get("/{college_id}", response_model=College)
def read_college(
    college_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Retrieve a specific college by ID.
    """
    db_college = college_service.get_college_by_id(db, college_id)
    if not db_college:
        raise HTTPException(
            status_code=404,
            detail="College not found"
        )
    return db_college

@router.put("/{college_id}", response_model=College)
def update_college(
    college_id: int,
    college_in: CollegeUpdate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Update a college.
    """
    db_college = college_service.get_college_by_id(db, college_id)
    if not db_college:
        raise HTTPException(
            status_code=404,
            detail="College not found"
        )
    return college_service.update_college(db, db_college, college_in)

@router.delete("/{college_id}", response_model=College)
def delete_college(
    college_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Delete a college.
    """
    db_college = college_service.get_college_by_id(db, college_id)
    if not db_college:
        raise HTTPException(
            status_code=404,
            detail="College not found"
        )
    return college_service.delete_college(db, college_id)