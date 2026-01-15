from sqlalchemy import Column, Integer, String, Date, Enum
import enum
from app.db.base_class import Base

class InternStatus(str, enum.Enum):
    ONBOARDING = "onboarding"
    ACTIVE = "active"
    COMPLETED = "completed"
    TERMINATED = "terminated"

class Intern(Base):
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    university = Column(String, index=True)
    department = Column(String, index=True)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(Enum(InternStatus), default=InternStatus.ONBOARDING)
