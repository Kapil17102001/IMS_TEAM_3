from sqlalchemy import Column, String, Text, Enum, Integer, TIMESTAMP, ForeignKey, Date
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum
from datetime import date

class TaskStatus(str, enum.Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    REVIEW = "REVIEW"

class TaskPriority(str,enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM" 
    HIGH = "HIGH"

class Task(Base):
    task_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    position = Column(Integer, nullable=False)
    due_date = Column(Date, nullable=False)
    priority = Column(Enum(TaskPriority),nullable = False)
    created_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
