from sqlalchemy.orm import Session
from app.models.taskAssignment import TaskAssignment
from app.schemas.task_assignment import TaskAssignmentCreate, TaskAssignmentUpdate

def create_task_assignment(db: Session, task_assignment: TaskAssignmentCreate):
    db_task_assignment = TaskAssignment(**task_assignment.dict())
    db.add(db_task_assignment)
    db.commit()
    db.refresh(db_task_assignment)
    return db_task_assignment 

def get_task_assignment(db: Session, task_id: int, intern_id: int):
    return db.query(TaskAssignment).filter(
        TaskAssignment.task_id == task_id,
        TaskAssignment.intern_id == intern_id
    ).first()

def update_task_assignment(db: Session, task_id: int, intern_id: int, task_assignment_update: TaskAssignmentUpdate):
    db_task_assignment = get_task_assignment(db, task_id, intern_id)
    if not db_task_assignment:
        return None
    for key, value in task_assignment_update.dict(exclude_unset=True).items():
        setattr(db_task_assignment, key, value)
    db.commit()
    db.refresh(db_task_assignment)
    return db_task_assignment

def delete_task_assignment(db: Session, task_id: int, intern_id: int):
    db_task_assignment = get_task_assignment(db, task_id, intern_id)
    if not db_task_assignment:
        return None
    db.delete(db_task_assignment)
    db.commit()
    return db_task_assignment