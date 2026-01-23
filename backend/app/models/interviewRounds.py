from sqlalchemy import Column, Integer, String, Enum
from app.db.base_class import Base
from app.models.enums import RoundName

class InterviewRounds(Base):
    id = Column(Integer, primary_key=True, index=True)
    round_number = Column(Integer, index=True, nullable=False)
    round_name = Column(Enum(RoundName), index=True, nullable=False)