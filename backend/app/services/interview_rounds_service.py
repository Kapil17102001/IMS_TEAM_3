from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.interviewRounds import InterviewRounds, RoundName
from app.schemas.interview_rounds import InterviewRoundsCreate, InterviewRoundsUpdate


class InterviewRoundsService:
    def get_interview_rounds(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[InterviewRounds]:
        return db.query(InterviewRounds).offset(skip).limit(limit).all()

    def get_interview_round_by_id(
        self, db: Session, interview_round_id: int
    ) -> Optional[InterviewRounds]:
        return db.query(InterviewRounds).filter(InterviewRounds.round_number == interview_round_id).first()

    def create_interview_round(
        self, db: Session, interview_round_in: InterviewRoundsCreate
    ) -> InterviewRounds:
        db_interview_round = InterviewRounds(
            round_number=interview_round_in.round_number,
            round_name=interview_round_in.round_name,
        )
        db.add(db_interview_round)
        db.commit()
        db.refresh(db_interview_round)
        return db_interview_round

    def update_interview_round(
        self,
        db: Session,
        db_interview_round: InterviewRounds,
        interview_round_in: InterviewRoundsUpdate,
    ) -> InterviewRounds:
        update_data = interview_round_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_interview_round, field, value)

        db.add(db_interview_round)
        db.commit()
        db.refresh(db_interview_round)
        return db_interview_round

    def delete_interview_round(
        self, db: Session, interview_round_id: int
    ) -> Optional[InterviewRounds]:
        db_interview_round = self.get_interview_round_by_id(db, interview_round_id)
        if db_interview_round:
            db.delete(db_interview_round)
            db.commit()
        return db_interview_round


interview_rounds_service = InterviewRoundsService()