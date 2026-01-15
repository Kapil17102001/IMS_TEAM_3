from sqlalchemy.orm import Session
from app.models.item import Item
from app.schemas.item import ItemCreate

class ItemService:
    def get_items(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(Item).offset(skip).limit(limit).all()

    def create_item(self, db: Session, item: ItemCreate):
        db_item = Item(title=item.title, description=item.description)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

item_service = ItemService()
