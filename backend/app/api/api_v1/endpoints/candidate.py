from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.candidate import Candidate, CandidateCreate, CandidateUpdate
from app.services.candidate_service import candidate_service

router = APIRouter()


@router.get("/", response_model=List[Candidate])
def read_candidates(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all candidates with pagination.
    """
    return candidate_service.get_candidates(db, skip=skip, limit=limit)


@router.post("/", response_model=Candidate, status_code=status.HTTP_201_CREATED)
def create_candidate(
    *,
    db: Session = Depends(deps.get_db),
    candidate_in: CandidateCreate
) -> Any:
    """
    Create a new candidate.
    """
    db_candidate = candidate_service.get_candidate_by_email(
        db, email=candidate_in.email
    )
    if db_candidate:
        raise HTTPException(
            status_code=400,
            detail="A candidate with this email already exists."
        )

    return candidate_service.create_candidate(
        db=db, candidate_in=candidate_in
    )


@router.get("/{candidate_id}", response_model=Candidate)
def read_candidate_by_id(
    candidate_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get a specific candidate by ID.
    """
    db_candidate = candidate_service.get_candidate_by_id(
        db, candidate_id=candidate_id
    )
    if not db_candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )
    return db_candidate


@router.put("/{candidate_id}", response_model=Candidate)
def update_candidate(
    *,
    db: Session = Depends(deps.get_db),
    candidate_id: int,
    candidate_in: CandidateUpdate
) -> Any:
    """
    Update a candidate's information.
    """
    db_candidate = candidate_service.get_candidate_by_id(
        db, candidate_id=candidate_id
    )
    if not db_candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    return candidate_service.update_candidate(
        db=db,
        db_candidate=db_candidate,
        candidate_in=candidate_in
    )


@router.delete("/{candidate_id}", response_model=Candidate)
def delete_candidate(
    *,
    db: Session = Depends(deps.get_db),
    candidate_id: int
) -> Any:
    """
    Remove a candidate from the system.
    """
    db_candidate = candidate_service.get_candidate_by_id(
        db, candidate_id=candidate_id
    )
    if not db_candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    return candidate_service.delete_candidate(
        db=db, candidate_id=candidate_id
    )
