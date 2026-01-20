from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.task_assignment import TaskAssignmentBase, TaskAssignmentCreate, TaskAssignmentUpdate
from app.services.task_assignment_service import (
    create_task_assignment,
    get_task_assignment,
    update_task_assignment,
    delete_task_assignment
)
from app.api.deps import get_db

router = APIRouter()

@router.post("/task-assignments/", response_model=TaskAssignmentBase)
def create_task_assignment_endpoint(
    task_assignment: TaskAssignmentCreate, db: Session = Depends(get_db)
):
    return create_task_assignment(db, task_assignment)

@router.get("/task-assignments/{task_id}/{intern_id}", response_model=TaskAssignmentBase)
def get_task_assignment_endpoint(
    task_id: int, intern_id: int, db: Session = Depends(get_db)
):
    task_assignment = get_task_assignment(db, task_id, intern_id)
    if not task_assignment:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return task_assignment

@router.put("/task-assignments/{task_id}/{intern_id}", response_model=TaskAssignmentBase)
def update_task_assignment_endpoint(
    task_id: int,
    intern_id: int,
    task_assignment_update: TaskAssignmentUpdate,
    db: Session = Depends(get_db),
):
    updated_task_assignment = update_task_assignment(db, task_id, intern_id, task_assignment_update)
    if not updated_task_assignment:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return updated_task_assignment

@router.delete("/task-assignments/{task_id}/{intern_id}", response_model=TaskAssignmentBase)
def delete_task_assignment_endpoint(
    task_id: int, intern_id: int, db: Session = Depends(get_db)
):
    deleted_task_assignment = delete_task_assignment(db, task_id, intern_id)
    if not deleted_task_assignment:
        raise HTTPException(status_code=404, detail="Task assignment not found")
    return deleted_task_assignment