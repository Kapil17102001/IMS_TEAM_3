from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.services.task_service import create_task, get_task, get_tasks, update_task, delete_task
from app.schemas.task import TaskCreate, TaskUpdate, Task
from app.api.deps import get_db
from app.services.task_assignment_service import create_task_assignment, get_task_assignment
from app.schemas.task_assignment import TaskAssignmentCreate
from app.models.taskAssignment import TaskAssignment

router = APIRouter()

@router.post("/tasks", response_model=Task)
def create_new_task(task_data: TaskCreate, db: Session = Depends(get_db), user_id: int = 1):
    """Create a new task."""
    task = create_task(db, task_data, user_id)

    # Convert the SQLAlchemy model instance to a dictionary
    task_dict = task.__dict__.copy()
    task_dict.pop("_sa_instance_state", None)  # Remove SQLAlchemy internal state

    # Assign the task to the provided intern
    assigned_intern = None
    if task_data.assigned_intern:
        task_assignment = TaskAssignmentCreate(task_id=task.task_id, intern_id=task_data.assigned_intern)
        create_task_assignment(db, task_assignment)
        assigned_intern = str(task_data.assigned_intern)

    # Add assignedIntern to the task response
    task_dict["assignedIntern"] = assigned_intern

    return Task(**task_dict)

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
    tasks = get_tasks(db, user_id)

    # Add assignedIntern field to each task as a string
    tasks_with_interns = []
    for task in tasks:
        task_assignment = db.query(TaskAssignment).filter(TaskAssignment.task_id == task.task_id).first()
        assigned_intern = str(task_assignment.intern_id) if task_assignment else None
        task_dict = task.__dict__.copy()  # Create a copy of the task dictionary
        task_dict["assignedIntern"] = assigned_intern  # Use the correct field name
        tasks_with_interns.append(task_dict)

    return tasks_with_interns

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

@router.put("/tasks/{task_id}/status")
def update_task_status(task_id: int, status: str, db: Session = Depends(get_db))->str:
    """Update the status of a task."""
    task = get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = status
    db.commit()
    return "Success"

@router.get("/tasks/intern/{intern_id}", response_model=List[Task])
def get_tasks_by_intern(intern_id: int, db: Session = Depends(get_db)):
    """Get all tasks assigned to a specific intern."""
    tasks = db.query(TaskAssignment).filter(TaskAssignment.intern_id == intern_id).all()

    if not tasks:
        raise HTTPException(status_code=404, detail="No tasks found for the given intern ID")

    tasks_with_details = []
    for task_assignment in tasks:
        task = get_task(db, task_assignment.task_id)
        if task:
            task_dict = task.__dict__.copy()
            task_dict.pop("_sa_instance_state", None)  # Remove SQLAlchemy internal state
            task_dict["assignedIntern"] = str(intern_id)
            tasks_with_details.append(task_dict)

    return tasks_with_details