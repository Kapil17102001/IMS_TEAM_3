from sqlalchemy import Column, Integer, String, Enum, Date, ARRAY
import enum
from app.db.base_class import Base
from app.models.enums import RoundName



class Candidate(Base):
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String, index=True, nullable=True)
    email = Column(String, index=True, nullable=True)
    university = Column(String, index=True, nullable=True)
    status = Column(Enum(RoundName), default=RoundName.ASSESSMENT, nullable=True)
    address = Column(String, nullable=True)
    resume_name = Column(String, nullable=True)
    application_date = Column(Date, nullable=True)
    source = Column(String, nullable=True)
    skills = Column(String, nullable=True)
