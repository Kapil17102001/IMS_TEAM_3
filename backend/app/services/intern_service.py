from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.intern import Intern
from app.schemas.intern import InternCreate, InternUpdate

class InternService:
    def get_interns(self, db: Session, skip: int = 0, limit: int = 100) -> List[Intern]:
        return db.query(Intern).offset(skip).limit(limit).all()

    def get_intern_by_id(self, db: Session, intern_id: int) -> Optional[Intern]:
        return db.query(Intern).filter(Intern.id == intern_id).first()

    def get_intern_by_email(self, db: Session, email: str) -> Optional[Intern]:
        return db.query(Intern).filter(Intern.email == email).first()

    def create_intern(self, db: Session, intern_in: InternCreate) -> Intern:
        db_intern = Intern(
            full_name=intern_in.full_name,
            email=intern_in.email,
            university=intern_in.university,
            department=intern_in.department,
            start_date=intern_in.start_date,
            end_date=intern_in.end_date,
            status=intern_in.status
        )
        db.add(db_intern)
        db.commit()
        db.refresh(db_intern)
        return db_intern

    def update_intern(self, db: Session, db_intern: Intern, intern_in: InternUpdate) -> Intern:
        update_data = intern_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_intern, field, value)
        
        db.add(db_intern)
        db.commit()
        db.refresh(db_intern)
        return db_intern

    def delete_intern(self, db: Session, intern_id: int) -> Optional[Intern]:
        db_intern = self.get_intern_by_id(db, intern_id)
        if db_intern:
            db.delete(db_intern)
            db.commit()
        return db_intern

intern_service = InternService()
