from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
from app.models.intern import InternStatus,Gender

class InternBase(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    university: Optional[str] = None
    department: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[InternStatus] = InternStatus.ONBOARDING
    address: Optional[str]
    job_position: Optional[str]
    salary: Optional[str]
    gender: Optional[Gender]

class InternCreate(InternBase):
    full_name: str
    email: EmailStr

class InternUpdate(InternBase):
    pass

class Intern(InternBase):
    id: int

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "full_name": "John Doe",
                "email": "john.doe@example.com",
                "university": "Example University",
                "department": "Engineering",
                "start_date": "2024-01-15",
                "end_date": "2024-06-15",
                "status": "onboarding"
                
            }
        }
    
