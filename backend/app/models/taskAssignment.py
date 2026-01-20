from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base


class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    task_id = Column(Integer, ForeignKey("task.task_id"), primary_key=True, nullable=False)
    intern_id = Column(Integer, ForeignKey("intern.id"), primary_key=True, nullable=False)
    assigned_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)