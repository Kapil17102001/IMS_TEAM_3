from pydantic import BaseModel
from typing import Optional
from app.models.candidate_interviews import InterviewStatus


class CandidateInterviewsBase(BaseModel):
    candidate_id: Optional[int] = None
    round_id: Optional[int] = None
    score: Optional[int] = None
    feedback: Optional[str] = None
    status: Optional[InterviewStatus] = None


class CandidateInterviewsCreate(CandidateInterviewsBase):
    candidate_id: int
    round_id: int
    score: int
    feedback: str
    status: InterviewStatus


class CandidateInterviewsUpdate(CandidateInterviewsBase):
    pass


class CandidateInterviews(CandidateInterviewsBase):
    id: int

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "candidate_id": 101,
                "round_id": 5,
                "score": 4,
                "feedback": "Great communication skills and technical knowledge.",
                "status": "selected",
            }
        }