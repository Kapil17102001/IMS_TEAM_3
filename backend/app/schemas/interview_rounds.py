from pydantic import BaseModel
from enum import Enum
from app.models.interviewRounds import RoundName
from typing import Optional


class InterviewRoundsBase(BaseModel):
    round_number: Optional[int] = None
    round_name: Optional[RoundName] = None


class InterviewRoundsCreate(InterviewRoundsBase):
    round_number: int
    round_name: RoundName


class InterviewRoundsUpdate(InterviewRoundsBase):
    pass


class InterviewRounds(InterviewRoundsBase):
    id: int

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "round_number": 1,
                "round_name": "pending",
            }
        }