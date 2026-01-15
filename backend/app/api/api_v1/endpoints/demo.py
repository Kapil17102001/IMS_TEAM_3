from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.item import Item, ItemCreate
from app.services.item_service import item_service

router = APIRouter()

@router.post("/items/", response_model=Item)
def create_item(
    item: ItemCreate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Create a new item.
    """
    return item_service.create_item(db=db, item=item)

@router.get("/items/", response_model=List[Item])
def read_items(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Retrieve items.
    """
    items = item_service.get_items(db, skip=skip, limit=limit)
    return items
