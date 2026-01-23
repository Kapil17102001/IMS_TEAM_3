from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class College(Base):
    id = Column(Integer, primary_key=True, index=True)
    college_name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, index=True, nullable=False)
    address = Column(String, index=True)
    head_name = Column(String, index=True, nullable=False)
    head_phone = Column(String, index=True, nullable=False)