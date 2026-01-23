from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey
import enum
from app.db.base_class import Base

class UserRole(enum.Enum):
    ADMIN = "admin"
    INTERN = "intern"
    COLLEGE = "college"
    PANEL = "panel"

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.INTERN)
    intern_id = Column(Integer, ForeignKey("intern.id"), nullable=True)  # Link to intern table
    college_id = Column(Integer, ForeignKey("college.id"), nullable=True)  # Link to college table
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)