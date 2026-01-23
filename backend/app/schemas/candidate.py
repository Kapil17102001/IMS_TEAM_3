from pydantic import BaseModel, EmailStr
from typing import Optional, List
from app.models.enums import RoundName


class CandidateBase(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    university: Optional[str] = None
    status: Optional[RoundName] = RoundName.ASSESSMENT
    address: Optional[str] = None
    resume_name: Optional[str] = None
    application_date: Optional[str] = None
    source: Optional[str] = None
    skills: Optional[str] = None


class CandidateCreate(CandidateBase):
    full_name: str
    email: EmailStr
    resume_name: str
    application_date: str
    source: str
    skills: str


class CandidateUpdate(CandidateBase):
    pass


class Candidate(CandidateBase):
    id: int

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "full_name": "Alice Johnson",
                "email": "alice.johnson@example.com",
                "university": "Example University",
                "status": "pending",
                "address": "Bangalore, India",
                "resume_name": "alice_resume.pdf",
                "application_date": "2024-01-25",
                "source": "Employee Referral",
                "skills": "Python , Java, C++ "
            }
        }
