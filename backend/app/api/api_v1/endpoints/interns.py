from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.intern import Intern, InternCreate, InternUpdate
from app.services.intern_service import intern_service

router = APIRouter()

@router.get("/", response_model=List[Intern])
def read_interns(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all interns with pagination.
    """
    return intern_service.get_interns(db, skip=skip, limit=limit)

@router.post("/", response_model=Intern, status_code=status.HTTP_201_CREATED)
def create_intern(
    *,
    db: Session = Depends(deps.get_db),
    intern_in: InternCreate
) -> Any:
    """
    Create a new intern during onboarding.
    """
    db_intern = intern_service.get_intern_by_email(db, email=intern_in.email)
    if db_intern:
        raise HTTPException(
            status_code=400,
            detail="An intern with this email already exists in the system."
        )
    return intern_service.create_intern(db=db, intern_in=intern_in)

@router.get("/{intern_id}", response_model=Intern)
def read_intern_by_id(
    intern_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get a specific intern by ID.
    """
    db_intern = intern_service.get_intern_by_id(db, intern_id=intern_id)
    if not db_intern:
        raise HTTPException(
            status_code=404,
            detail="Intern not found"
        )
    return db_intern

@router.put("/{intern_id}", response_model=Intern)
def update_intern(
    *,
    db: Session = Depends(deps.get_db),
    intern_id: int,
    intern_in: InternUpdate
) -> Any:
    """
    Update an intern's information.
    """
    db_intern = intern_service.get_intern_by_id(db, intern_id=intern_id)
    if not db_intern:
        raise HTTPException(
            status_code=404,
            detail="Intern not found"
        )
    return intern_service.update_intern(db=db, db_intern=db_intern, intern_in=intern_in)

@router.delete("/{intern_id}", response_model=Intern)
def delete_intern(
    *,
    db: Session = Depends(deps.get_db),
    intern_id: int
) -> Any:
    """
    Remove an intern from the system.
    """
    db_intern = intern_service.get_intern_by_id(db, intern_id=intern_id)
    if not db_intern:
        raise HTTPException(
            status_code=404,
            detail="Intern not found"
        )
    return intern_service.delete_intern(db=db, intern_id=intern_id)
