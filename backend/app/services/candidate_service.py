from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateCreate, CandidateUpdate


class CandidateService:
    def get_candidates(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[Candidate]:
        return db.query(Candidate).offset(skip).limit(limit).all()

    def get_candidate_by_id(
        self, db: Session, candidate_id: int
    ) -> Optional[Candidate]:
        return db.query(Candidate).filter(Candidate.id == candidate_id).first()

    def get_candidate_by_email(
        self, db: Session, email: str
    ) -> Optional[Candidate]:
        return db.query(Candidate).filter(Candidate.email == email).first()

    def create_candidate(
        self, db: Session, candidate_in: CandidateCreate
    ) -> Candidate:
        db_candidate = Candidate(
            full_name=candidate_in.full_name,
            email=candidate_in.email,
            university=candidate_in.university,
            status=candidate_in.status,
            address=candidate_in.address,
            resume_name = candidate_in.resume_name,
            application_date = candidate_in.application_date,
            source = candidate_in.source,
            skills = candidate_in.skills,
            college_id = candidate_in.college_id
        )
        db.add(db_candidate)
        db.commit()
        db.refresh(db_candidate)
        return db_candidate

    def update_candidate(
        self,
        db: Session,
        db_candidate: Candidate,
        candidate_in: CandidateUpdate,
    ) -> Candidate:
        update_data = candidate_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_candidate, field, value)

        db.add(db_candidate)
        db.commit()
        db.refresh(db_candidate)
        return db_candidate

    def delete_candidate(
        self, db: Session, candidate_id: int
    ) -> Optional[Candidate]:
        db_candidate = self.get_candidate_by_id(db, candidate_id)
        if db_candidate:
            db.delete(db_candidate)
            db.commit()
        return db_candidate

    def get_candidates_by_status(
        self, db: Session, status: str, skip: int = 0, limit: int = 100
    ) -> List[Candidate]:
        return db.query(Candidate).filter(Candidate.status == status).offset(skip).limit(limit).all()


candidate_service = CandidateService()
