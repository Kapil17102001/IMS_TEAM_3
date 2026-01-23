from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.college import College
from app.schemas.college import CollegeCreate, CollegeUpdate

class CollegeService:
    def get_colleges(self, db: Session, skip: int = 0, limit: int = 100) -> List[College]:
        return db.query(College).offset(skip).limit(limit).all()

    def get_college_by_id(self, db: Session, college_id: int) -> Optional[College]:
        return db.query(College).filter(College.id == college_id).first()

    def get_college_by_email(self, db: Session, email: str) -> Optional[College]:
        return db.query(College).filter(College.email == email).first()

    def create_college(self, db: Session, college_in: CollegeCreate) -> College:
        db_college = College(
            college_name=college_in.college_name,
            email=college_in.email,
            phone=college_in.phone,
            address=college_in.address,
            head_name=college_in.head_name,
            head_phone=college_in.head_phone,
        )
        db.add(db_college)
        db.commit()
        db.refresh(db_college)
        return db_college

    def update_college(self, db: Session, db_college: College, college_in: CollegeUpdate) -> College:
        update_data = college_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_college, field, value)
        
        db.add(db_college)
        db.commit()
        db.refresh(db_college)
        return db_college

    def delete_college(self, db: Session, college_id: int) -> Optional[College]:
        db_college = self.get_college_by_id(db, college_id)
        if db_college:
            db.delete(db_college)
            db.commit()
        return db_college

college_service = CollegeService()