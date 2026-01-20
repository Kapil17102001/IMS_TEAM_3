from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskAssignmentBase(BaseModel):
    task_id: int
    intern_id: int
    assigned_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class TaskAssignmentCreate(TaskAssignmentBase):
    pass 

class TaskAssignmentUpdate(BaseModel):
    assigned_at: Optional[datetime] = None