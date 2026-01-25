from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.models.enums import RoundName
from datetime import date


class CandidateBase(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    university: Optional[str] = None
    status: Optional[RoundName] = RoundName.ASSESSMENT
    address: Optional[str] = None
    resume_name: Optional[str] = None
    application_date: Optional[date] = None
    source: Optional[str] = None
    skills: Optional[str] = None
    college_id : Optional[int] = None


class CandidateCreate(CandidateBase):
    full_name: str
    email: EmailStr
    resume_name: str
    application_date: date
    source: str
    skills: str
    college_id: int


class CandidateUpdate(CandidateBase):
    pass


class Candidate(CandidateBase):
    id: int

    class Config:
        from_attributes = True
        json_encoders = {
            date: lambda v: v.isoformat(),  # Serialize date as ISO 8601 string
        }
        json_schema_extra = {
            "example": {
                "id": 1,
                "full_name": "Alice Johnson",
                "email": "alice.johnson@example.com",
                "university": "Example University",
                "status": "assessment",
                "address": "Bangalore, India",
                "resume_name": "alice_resume.pdf",
                "application_date": "2024-01-25",
                "source": "Employee Referral",
                "skills": "Python , Java, C++ ",
                "college_id": 1
            }
        }
