from datetime import date, timedelta
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.candidate_interviews import CandidateInterviews, CandidateInterviewsCreate, CandidateInterviewsUpdate
from app.services.candidate_interviews_service import candidate_interviews_service
from app.services.candidate_service import candidate_service
from app.models.enums import RoundName
from app.services.interview_rounds_service import interview_rounds_service
from app.services.intern_service import intern_service
from app.schemas.intern import InternCreate

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
async def save_feedback(
    *,
    db: Session = Depends(deps.get_db),
    feedback_data: dict
) -> Any:
    """
    Save feedback for a candidate.
    """
    print(f"The payload is : {feedback_data}")
    candidate_id = feedback_data.get("candidateId")
    round_number = feedback_data.get("round") # This is the TARGET round number (1-6)
    feedback = feedback_data.get("feedback")
    rating = feedback_data.get("rating")

    # Validate input
    if not candidate_id or not round_number or feedback is None or rating is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid input data. Please provide candidateId, round, feedback, and rating."
        )

    # 1. Fetch Candidate
    candidate = candidate_service.get_candidate_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found."
        )

    # 2. Handle Feedback Entry Creation (for the CURRENT/Previous status)
    from app.models.interviewRounds import InterviewRounds
    current_round = db.query(InterviewRounds).filter(InterviewRounds.round_name == candidate.status).first()

    if current_round:
        is_rejection = (round_number == 6)
        interview_status = "rejected" if is_rejection else "selected"

        from app.schemas.candidate_interviews import CandidateInterviewsCreate
        
        candidate_interview_in = CandidateInterviewsCreate(
            candidate_id=candidate_id,
            round_id=current_round.id, 
            score=rating,
            feedback=feedback,
            status=interview_status
        )

        candidate_interview = candidate_interviews_service.create_candidate_interview(
            db=db,
            candidate_interview_in=candidate_interview_in
        )
        db.add(candidate_interview)
        db.commit()
        db.refresh(candidate_interview)
    else:
        print(f"Skipping interview entry creation for status: {candidate.status}")


    # 3. Update Candidate Status to TARGET
    target_round = interview_rounds_service.get_interview_round_by_id(db, round_number)
    
    if not target_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target round ID {round_number} not found in InterviewRounds table."
        )
        
    candidate.status = target_round.round_name
    db.add(candidate)

    # 4. If status updated to HIRED, candidate is ready for manual onboarding
    if target_round.round_name == RoundName.HIRED:
        print(f"Candidate {candidate.id} is now HIRED and ready for onboarding.")
        # We no longer auto-create the intern record here. 
        # The HR/Admin will go to the Onboarding page to complete the process.

    db.commit()
    db.refresh(candidate)

    return {"message": "Feedback saved successfully and candidate moved to hired." if target_round.round_name == RoundName.HIRED else "Feedback saved successfully."}


@router.post("/schedule-interview", status_code=status.HTTP_200_OK)
async def schedule_interview(
    *,
    db: Session = Depends(deps.get_db),
    schedule_data: dict
) -> Any:
    """
    Schedule an interview for a candidate at a specific round.
    """
    print(f"Schedule interview payload: {schedule_data}")
    candidate_id = schedule_data.get("candidateId")
    round_number = schedule_data.get("round")
    interview_date = schedule_data.get("interviewDate")
    interview_time = schedule_data.get("interviewTime")

    # Validate input
    if not candidate_id or not round_number or not interview_date or not interview_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid input data. Please provide candidateId, round, interviewDate, and interviewTime."
        )

    # Fetch Candidate
    candidate = candidate_service.get_candidate_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found."
        )

    # Get the interview round
    from app.models.interviewRounds import InterviewRounds
    interview_round = interview_rounds_service.get_interview_round_by_id(db, round_number)
    
    if not interview_round:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Interview round {round_number} not found."
        )

    # Parse datetime and time
    from datetime import datetime as dt
    try:
        parsed_datetime = dt.fromisoformat(interview_date.replace('Z', '+00:00'))
        parsed_time = dt.strptime(interview_time, "%H:%M").time()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date or time format: {str(e)}"
        )

    # Create or update the candidate interview record with scheduled time
    from app.models.candidate_interviews import CandidateInterviews, InterviewStatus
    
    # Check if there's already an interview record for this candidate and round
    existing_interview = db.query(CandidateInterviews).filter(
        CandidateInterviews.candidate_id == candidate_id,
        CandidateInterviews.round_id == interview_round.id
    ).first()

    if existing_interview:
        # Update existing record
        existing_interview.interview_date = parsed_datetime
        existing_interview.interview_time = parsed_time
        db.add(existing_interview)
    else:
        # Create new record
        new_interview = CandidateInterviews(
            candidate_id=candidate_id,
            round_id=interview_round.id,
            interview_date=parsed_datetime,
            interview_time=parsed_time,
            status=InterviewStatus.SELECTED  # Default status
        )
        db.add(new_interview)

    db.commit()

    return {
        "message": f"Interview scheduled successfully for round {interview_round.round_name}",
        "interview_date": parsed_datetime.isoformat(),
        "interview_time": parsed_time.strftime("%H:%M")
    }

