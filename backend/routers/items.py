from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from database import get_db
import models.models as models
import schemas.schemas as schemas
from routers.image import delete_image_if_unused

router = APIRouter(
    prefix="/items",
    tags=["items"]
)


def item_to_dict(item: models.Item):
    data = schemas.Item.model_validate(item).model_dump(mode="json")
    data["container_name"] = item.container.name if item.container else None
    return data


def check_container_exists(db: Session, container_id: Optional[int]):
    if container_id is not None and db.get(models.Container, container_id) is None:
        raise HTTPException(status_code=400, detail="Container does not exist")


@router.get("/", response_model=schemas.PaginatedResponse)
def get_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    q: Optional[str] = Query(None, description="Search name and description"),
    container_id: Optional[int] = Query(None),
    unassigned: bool = Query(False, description="Only items without a container"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Item)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(models.Item.name.ilike(like), models.Item.description.ilike(like)))
    if container_id is not None:
        query = query.filter(models.Item.contained_in == container_id)
    if unassigned:
        query = query.filter(models.Item.contained_in.is_(None))

    total = query.count()
    items = (
        query.options(joinedload(models.Item.container))
        .order_by(models.Item.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "items": [item_to_dict(item) for item in items]
    }

@router.get("/{item_id}", response_model=schemas.ItemWithLocation)
def get_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.get(models.Item, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item_to_dict(db_item)

@router.post("/", response_model=schemas.ItemWithLocation)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    check_container_exists(db, item.contained_in)
    db_item = models.Item(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return item_to_dict(db_item)

@router.put("/{item_id}", response_model=schemas.ItemWithLocation)
def update_item(item_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = db.get(models.Item, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    check_container_exists(db, item.contained_in)

    old_image = db_item.image_path
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)

    db.commit()
    if old_image != db_item.image_path:
        delete_image_if_unused(db, old_image)
    db.refresh(db_item)
    return item_to_dict(db_item)

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.get(models.Item, item_id)
    if db_item is None:
        raise HTTPException(status_code=404, detail="Item not found")

    image_path = db_item.image_path
    db.delete(db_item)
    db.commit()
    delete_image_if_unused(db, image_path)
    return {"message": "Item deleted successfully"}
