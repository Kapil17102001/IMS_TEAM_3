from pydantic import BaseModel, EmailStr
from typing import Optional

class CollegeBase(BaseModel):
    college_name: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    head_name: str
    head_phone: str


class CollegeCreate(CollegeBase):
    pass


class CollegeUpdate(BaseModel):
    college_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    head_name: Optional[str] = None
    head_phone: Optional[str] = None


class College(CollegeBase):
    id: int

    class Config:
        from_attributes = True