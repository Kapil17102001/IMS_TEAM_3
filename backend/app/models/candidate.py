from sqlalchemy import Column, Integer, String, Enum
import enum
from app.db.base_class import Base

class CandidateStatus(str, enum.Enum):
    PENDING = "pending"
    ASSESSMENT = "assessment"
    INTERVIEW1 = "interview1"
    INTERVIEW2 = "interview2"
    HR = "hr"
    HIRED = "hired"
    REJECTED = "rejected"

class Candidate(Base):
    id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    full_name = Column(String, index=True, nullable=True)
    email = Column(String, index=True, nullable=True)
    university = Column(String, index=True, nullable=True)
    status = Column(Enum(CandidateStatus), default=CandidateStatus.PENDING, nullable=True)
    address = Column(String, nullable=True)
