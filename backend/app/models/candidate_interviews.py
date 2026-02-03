from sqlalchemy import Column, Integer, ForeignKey, Text, Enum, Float, DateTime, Time
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from enum import Enum as PyEnum


class InterviewStatus(PyEnum):
    REJECTED = "rejected"
    SELECTED = "selected"


class CandidateInterviews(Base):
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate.id"), nullable=False)
    round_id = Column(Integer, ForeignKey("interviewrounds.id"), nullable=False)
    score = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    status = Column(Enum(InterviewStatus), nullable=False)
    interview_date = Column(DateTime, nullable=True)
    interview_time = Column(Time, nullable=True)