from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.college import College, CollegeCreate, CollegeUpdate
from app.services.college_service import college_service
from app.services.email_service import email_service
import secrets
import string
from app.models.user import User, UserRole
from app.services.user_service import get_password_hash

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

    # Create the college in the database
    new_college = college_service.create_college(db=db, college_in=college_in)

    # Generate secure random password
    alphabet = string.ascii_letters + string.digits
    raw_password = ''.join(secrets.choice(alphabet) for i in range(12))
    
    # Create User for the College
    new_user = User(
        username=college_in.college_name.replace(" ", "_").lower(),
        email=college_in.email,
        hashed_password=get_password_hash(raw_password),
        role=UserRole.COLLEGE,
        college_id=new_college.id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    try:
        # Send eye-catchy invitation email to the college
        email_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
                body {{ font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }}
                .wrapper {{ padding: 40px 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }}
                .header {{ background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 40px; text-align: center; color: white; }}
                .header h1 {{ margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em; }}
                .content {{ padding: 40px; }}
                .greeting {{ font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 24px; }}
                .message {{ color: #475569; margin-bottom: 32px; font-size: 16px; }}
                .credentials-box {{ 
                    background: #f1f5f9; 
                    border-radius: 16px; 
                    padding: 24px; 
                    margin-bottom: 32px; 
                    border: 1px solid #e2e8f0;
                }}
                .credential-row {{ margin-bottom: 12px; }}
                .credential-row:last-child {{ margin-bottom: 0; }}
                .label {{ font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; display: block; }}
                .value {{ font-family: 'JetBrains Mono', monospace; font-size: 16px; color: #0f172a; font-weight: 600; }}
                .cta {{ display: block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-align: center; margin-bottom: 32px; transition: background 0.2s; }}
                .features {{ margin-bottom: 32px; }}
                .feature-item {{ list-style: none; padding-left: 0; margin-bottom: 12px; display: flex; align-items: center; color: #475569; font-size: 15px; }}
                .feature-bullet {{ color: #2563eb; font-weight: bold; margin-right: 12px; font-size: 18px; }}
                .footer {{ background: #f8fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; }}
                .signature-name {{ font-weight: 700; color: #0f172a; margin-bottom: 4px; }}
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h1>Recruitment Drive 2026</h1>
                    </div>
                    
                    <div class="content">
                        <p class="greeting">Dear {college_in.college_name},</p>
                        
                        <p class="message">
                            It is our pleasure to invite your institution to collaborate with <strong>Wissen Technology</strong> for our upcoming recruitment cycle. We are looking for the brightest minds to join our journey.
                        </p>

                        <div class="credentials-box">
                            <div class="credential-row">
                                <span class="label">Portal Login Email</span>
                                <span class="value">{college_in.email}</span>
                            </div>
                            <div class="credential-row">
                                <span class="label">Temporary Password</span>
                                <span class="value" style="color: #2563eb;">{raw_password}</span>
                            </div>
                        </div>

                        <a href="https://wissen.com/hiring-portal" class="cta">Log In to Portal</a>

                        <div class="features">
                            <div class="feature-item"><span class="feature-bullet">✓</span> Nominate top 100 eligible students</div>
                            <div class="feature-item"><span class="feature-bullet">✓</span> Seamlessly upload student resumes</div>
                            <div class="feature-item"><span class="feature-bullet">✓</span> Real-time tracking of candidate status</div>
                        </div>

                        <p class="message" style="margin-bottom: 0;">
                            Our hiring team is ready to review your nominees and proceed with interview scheduling immediately.
                        </p>
                    </div>
                    
                    <div class="footer">
                        <div class="signature-name">Abhay</div>
                        <div>Senior Software Engineer</div>
                        <div>Wissen Technology</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

        await email_service.send_email(
            email_to=[college_in.email],
            subject="Invitation: Partner with Wissen Technology for Placements",
            html_content=email_body
        )

    except Exception as e:
        print(f"Warning: Failed to create user or send email: {str(e)}")

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