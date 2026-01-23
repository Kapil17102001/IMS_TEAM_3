from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.interview_rounds import InterviewRounds, InterviewRoundsCreate, InterviewRoundsUpdate
from app.services.interview_rounds_service import interview_rounds_service

router = APIRouter()


@router.get("/", response_model=List[InterviewRounds])
def read_interview_rounds(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all interview rounds with pagination.
    """
    return interview_rounds_service.get_interview_rounds(db, skip=skip, limit=limit)


@router.post("/", response_model=InterviewRounds, status_code=status.HTTP_201_CREATED)
def create_interview_round(
    *,
    db: Session = Depends(deps.get_db),
    interview_round_in: InterviewRoundsCreate
) -> Any:
    """
    Create a new interview round.
    """
    return interview_rounds_service.create_interview_round(
        db=db, interview_round_in=interview_round_in
    )


@router.get("/{interview_round_id}", response_model=InterviewRounds)
def read_interview_round_by_id(
    interview_round_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get a specific interview round by ID.
    """
    db_interview_round = interview_rounds_service.get_interview_round_by_id(
        db, interview_round_id=interview_round_id
    )
    if not db_interview_round:
        raise HTTPException(
            status_code=404,
            detail="Interview round not found"
        )
    return db_interview_round


@router.put("/{interview_round_id}", response_model=InterviewRounds)
def update_interview_round(
    *,
    db: Session = Depends(deps.get_db),
    interview_round_id: int,
    interview_round_in: InterviewRoundsUpdate
) -> Any:
    """
    Update an interview round's information.
    """
    db_interview_round = interview_rounds_service.get_interview_round_by_id(
        db, interview_round_id=interview_round_id
    )
    if not db_interview_round:
        raise HTTPException(
            status_code=404,
            detail="Interview round not found"
        )

    return interview_rounds_service.update_interview_round(
        db=db,
        db_interview_round=db_interview_round,
        interview_round_in=interview_round_in
    )


@router.delete("/{interview_round_id}", response_model=InterviewRounds)
def delete_interview_round(
    *,
    db: Session = Depends(deps.get_db),
    interview_round_id: int
) -> Any:
    """
    Remove an interview round from the system.
    """
    db_interview_round = interview_rounds_service.get_interview_round_by_id(
        db, interview_round_id=interview_round_id
    )
    if not db_interview_round:
        raise HTTPException(
            status_code=404,
            detail="Interview round not found"
        )

    return interview_rounds_service.delete_interview_round(
        db=db, interview_round_id=interview_round_id
    )