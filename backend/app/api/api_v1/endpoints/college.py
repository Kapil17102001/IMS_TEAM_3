from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.college import College, CollegeCreate, CollegeUpdate
from app.services.college_service import college_service

router = APIRouter()

@router.get("/", response_model=List[College])
def read_colleges(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all colleges with pagination.
    """
    return college_service.get_colleges(db, skip=skip, limit=limit)

@router.post("/", response_model=College, status_code=status.HTTP_201_CREATED)
def create_college(
    *,
    db: Session = Depends(deps.get_db),
    college_in: CollegeCreate
) -> Any:
    """
    Create a new college.
    """
    db_college = college_service.get_college_by_email(db, email=college_in.email)
    if db_college:
        raise HTTPException(
            status_code=400,
            detail="A college with this email already exists."
        )
    return college_service.create_college(db=db, college_in=college_in)

@router.get("/{college_id}", response_model=College)
def read_college(
    college_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Retrieve a specific college by ID.
    """
    db_college = college_service.get_college_by_id(db, college_id)
    if not db_college:
        raise HTTPException(
            status_code=404,
            detail="College not found"
        )
    return db_college

@router.put("/{college_id}", response_model=College)
def update_college(
    college_id: int,
    college_in: CollegeUpdate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Update a college.
    """
    db_college = college_service.get_college_by_id(db, college_id)
    if not db_college:
        raise HTTPException(
            status_code=404,
            detail="College not found"
        )
    return college_service.update_college(db, db_college, college_in)

@router.delete("/{college_id}", response_model=College)
def delete_college(
    college_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Delete a college.
    """
    db_college = college_service.get_college_by_id(db, college_id)
    if not db_college:
        raise HTTPException(
            status_code=404,
            detail="College not found"
        )
    return college_service.delete_college(db, college_id)