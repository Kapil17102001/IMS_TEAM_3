from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.services.task_service import create_task, get_task, get_tasks, update_task, delete_task
from app.schemas.task import TaskCreate, TaskUpdate, Task
from app.api.deps import get_db

router = APIRouter()

@router.post("/tasks", response_model=Task)
def create_new_task(task_data: TaskCreate, db: Session = Depends(get_db), user_id: int = 1):
    """Create a new task."""
    return create_task(db, task_data, user_id)

@router.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    """Get a task by ID."""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/tasks", response_model=List[Task])
def read_tasks(db: Session = Depends(get_db), user_id: int = 1):
    """Get all tasks for the current user."""
    return get_tasks(db, user_id)

@router.put("/tasks/{task_id}", response_model=Task)
def update_existing_task(task_id: int, task_data: TaskUpdate, db: Session = Depends(get_db)):
    """Update an existing task."""
    task = update_task(db, task_id, task_data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/tasks/{task_id}")
def delete_existing_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task by ID."""
    success = delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}