from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime,date
from app.models.task import TaskStatus , TaskPriority

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[TaskStatus] = TaskStatus.TODO
    position: int
    due_date: Optional[date] = None
    priority: Optional[TaskPriority] = TaskPriority.MEDIUM

class TaskCreate(TaskBase):
    due_date: date
    priority: TaskPriority
    assigned_intern: Optional[int] = []

class TaskUpdate(TaskBase):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    position: Optional[int] = None
    due_date: Optional[date] = None
    priority: Optional[TaskPriority] = None

class TaskInDBBase(TaskBase):
    task_id: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Task(TaskInDBBase):
    assignedIntern:Optional[str]

class TaskInDB(TaskInDBBase):
    pass