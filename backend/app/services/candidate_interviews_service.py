from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.candidate_interviews import CandidateInterviews, InterviewStatus
from app.schemas.candidate_interviews import CandidateInterviewsCreate, CandidateInterviewsUpdate


class CandidateInterviewsService:
    def get_candidate_interviews(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[CandidateInterviews]:
        return db.query(CandidateInterviews).offset(skip).limit(limit).all()

    def get_candidate_interview_by_id(
        self, db: Session, candidate_interview_id: int
    ) -> Optional[List[CandidateInterviews]]:
        return db.query(CandidateInterviews).filter(CandidateInterviews.candidate_id == candidate_interview_id).all()

    def create_candidate_interview(
        self, db: Session, candidate_interview_in: CandidateInterviewsCreate
    ) -> CandidateInterviews:
        db_candidate_interview = CandidateInterviews(
            candidate_id=candidate_interview_in.candidate_id,
            round_id=candidate_interview_in.round_id,
            score=candidate_interview_in.score,
            feedback=candidate_interview_in.feedback,
            status=candidate_interview_in.status,
        )
        db.add(db_candidate_interview)
        db.commit()
        db.refresh(db_candidate_interview)
        return db_candidate_interview

    def update_candidate_interview(
        self,
        db: Session,
        db_candidate_interview: CandidateInterviews,
        candidate_interview_in: CandidateInterviewsUpdate,
    ) -> CandidateInterviews:
        update_data = candidate_interview_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_candidate_interview, field, value)

        db.add(db_candidate_interview)
        db.commit()
        db.refresh(db_candidate_interview)
        return db_candidate_interview

    def delete_candidate_interview(
        self, db: Session, candidate_interview_id: int
    ) -> Optional[CandidateInterviews]:
        db_candidate_interview = self.get_candidate_interview_by_id(db, candidate_interview_id)
        if db_candidate_interview:
            db.delete(db_candidate_interview)
            db.commit()
        return db_candidate_interview


candidate_interviews_service = CandidateInterviewsService()