from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.candidate import CandidateStatus


class CandidateBase(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    university: Optional[str] = None
    status: Optional[CandidateStatus] = CandidateStatus.PENDING
    address: Optional[str] = None


class CandidateCreate(CandidateBase):
    full_name: str
    email: EmailStr


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
                "address": "Bangalore, India"
            }
        }
