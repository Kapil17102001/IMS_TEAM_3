from sqlalchemy.orm import Session
from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate
from typing import List

def create_task(db: Session, task_data: TaskCreate, user_id: int) -> Task:
    """Create a new task."""
    new_task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        position=task_data.position,
        due_date=task_data.due_date,
        priority=task_data.priority,
        created_by=user_id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

def get_task(db: Session, task_id: str) -> Task:
    """Retrieve a task by its ID."""
    return db.query(Task).filter(Task.task_id == task_id).first()

def get_tasks(db: Session) -> List[Task]:
    """Retrieve all tasks created by a specific user."""
    return db.query(Task).order_by(Task.position).all()

def update_task(db: Session, task_id: str, task_data: TaskUpdate) -> Task:
    """Update an existing task."""
    task = get_task(db, task_id)
    if not task:
        return None

    for key, value in task_data.dict(exclude_unset=True).items():
        setattr(task, key, value)

    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    if task_data.priority is not None:
        task.priority = task_data.priority

    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: str) -> bool:
    """Delete a task by its ID."""
    task = get_task(db, task_id)
    if not task:
        return False

    db.delete(task)
    db.commit()
    return True