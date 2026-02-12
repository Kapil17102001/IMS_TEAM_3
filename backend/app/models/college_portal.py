from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Date,Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base_class import Base
from app.models.enums import FileUploadStatus,FileType

class CollegeStudent(Base):
    __tablename__ = "college_students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    roll_number = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, nullable=False) # INTERVIEW_SCHEDULED, CLEARED_INTERVIEW, HIRED, REJECTED
    hiring_date = Column(Date, nullable=True)
    joining_date = Column(Date, nullable=True)
    round_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

 

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    intern_id = Column(Integer, ForeignKey("intern.id"), nullable=False)
    status = Column(Enum(FileUploadStatus),default = FileUploadStatus.PENDING)
    feedback = Column(String,nullable = True)
    file_type = Column(Enum(FileType),nullable = True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class StudentResume(Base):
    __tablename__ = "student_resumes"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    college_id = Column(Integer,ForeignKey("college.id"),nullable=True)