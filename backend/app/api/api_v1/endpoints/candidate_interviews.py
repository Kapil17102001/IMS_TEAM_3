from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.candidate_interviews import CandidateInterviews, CandidateInterviewsCreate, CandidateInterviewsUpdate
from app.services.candidate_interviews_service import candidate_interviews_service
from app.services.candidate_service import candidate_service
from app.models.interviewRounds import RoundName
from app.services.interview_rounds_service import interview_rounds_service

router = APIRouter()


@router.get("/", response_model=List[CandidateInterviews])
def read_candidate_interviews(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all candidate interviews with pagination.
    """
    return candidate_interviews_service.get_candidate_interviews(db, skip=skip, limit=limit)


@router.post("/", response_model=CandidateInterviews, status_code=status.HTTP_201_CREATED)
def create_candidate_interview(
    *,
    db: Session = Depends(deps.get_db),
    candidate_interview_in: CandidateInterviewsCreate
) -> Any:
    """
    Create a new candidate interview.
    """
    return candidate_interviews_service.create_candidate_interview(
        db=db, candidate_interview_in=candidate_interview_in
    )


@router.get("/{candidate_interview_id}", response_model=List[CandidateInterviews])
def read_candidate_interview_by_id(
    candidate_interview_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get a specific candidate interview by ID.
    """
    db_candidate_interview = candidate_interviews_service.get_candidate_interview_by_id(
        db, candidate_interview_id=candidate_interview_id
    )
    if not db_candidate_interview:
        raise HTTPException(
            status_code=404,
            detail="Candidate interview not found"
        )
    return db_candidate_interview


@router.put("/{candidate_interview_id}", response_model=CandidateInterviews)
def update_candidate_interview(
    *,
    db: Session = Depends(deps.get_db),
    candidate_interview_id: int,
    candidate_interview_in: CandidateInterviewsUpdate
) -> Any:
    """
    Update a candidate interview's information.
    """
    db_candidate_interview = candidate_interviews_service.get_candidate_interview_by_id(
        db, candidate_interview_id=candidate_interview_id
    )
    if not db_candidate_interview:
        raise HTTPException(
            status_code=404,
            detail="Candidate interview not found"
        )

    return candidate_interviews_service.update_candidate_interview(
        db=db,
        db_candidate_interview=db_candidate_interview,
        candidate_interview_in=candidate_interview_in
    )


@router.delete("/{candidate_interview_id}", response_model=CandidateInterviews)
def delete_candidate_interview(
    *,
    db: Session = Depends(deps.get_db),
    candidate_interview_id: int
) -> Any:
    """
    Remove a candidate interview from the system.
    """
    db_candidate_interview = candidate_interviews_service.get_candidate_interview_by_id(
        db, candidate_interview_id=candidate_interview_id
    )
    if not db_candidate_interview:
        raise HTTPException(
            status_code=404,
            detail="Candidate interview not found"
        )

    return candidate_interviews_service.delete_candidate_interview(
        db=db, candidate_interview_id=candidate_interview_id
    )


@router.post("/save-feedback", status_code=status.HTTP_200_OK)
def save_feedback(
    *,
    db: Session = Depends(deps.get_db),
    feedback_data: dict
) -> Any:
    """
    Save feedback for a candidate.
    """
    print(f"The payload is : {feedback_data}")
    candidate_id = feedback_data.get("candidateId")
    round_id = feedback_data.get("round")
    feedback = feedback_data.get("feedback")
    rating = feedback_data.get("rating")

    # Validate input
    if not candidate_id or not round_id or feedback is None or rating is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid input data. Please provide candidateId, round, feedback, and rating."
        )

    # Convert feedback_data to CandidateInterviewsCreate schema
    from app.schemas.candidate_interviews import CandidateInterviewsCreate
    candidate_interview_in = CandidateInterviewsCreate(
        candidate_id=candidate_id,
        round_id=round_id-1,
        score=rating,
        feedback=feedback,
        status= "rejected" if rating == 6 else "selected"  # Default status
    )

    # Create a new candidate interview entry
    candidate_interview = candidate_interviews_service.create_candidate_interview(
        db=db,
        candidate_interview_in=candidate_interview_in
    )

    # Commit the new entry
    db.add(candidate_interview)
    db.commit()
    db.refresh(candidate_interview)

    # Update the candidate's status to the name of the current round
    candidate = candidate_service.get_candidate_by_id(db, candidate_id)

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found."
        )

    # Fetch the round name from the InterviewRounds table
    interview_round = interview_rounds_service.get_interview_round_by_id(db, round_id)
    if not interview_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Round ID not found in InterviewRounds table."
        )
    print(f"The value from db is : {interview_round.round_name}")
    round_name = interview_round.round_name

    candidate.status = round_name
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    return {"message": "Feedback saved successfully."}