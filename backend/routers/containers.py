from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, func
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models.models as models
import schemas.schemas as schemas
from routers.image import delete_image_if_unused

router = APIRouter(
    prefix="/containers",
    tags=["containers"]
)


def container_to_dict(container: models.Container, item_count: int = 0):
    data = schemas.Container.model_validate(container).model_dump(mode="json")
    data["room_name"] = container.room.name if container.room else None
    data["item_count"] = item_count
    return data


def item_counts(db: Session, container_ids):
    if not container_ids:
        return {}
    rows = (
        db.query(models.Item.contained_in, func.count(models.Item.id))
        .filter(models.Item.contained_in.in_(container_ids))
        .group_by(models.Item.contained_in)
        .all()
    )
    return dict(rows)


def validate_container(db: Session, container: schemas.ContainerCreate, container_id: Optional[int] = None):
    if container.room_id is not None and db.get(models.Room, container.room_id) is None:
        raise HTTPException(status_code=400, detail="Room does not exist")

    # Walk up the parent chain to make sure we don't create a loop (A in B in A)
    parent_id = container.contained_in
    seen = set()
    while parent_id is not None:
        if parent_id == container_id:
            raise HTTPException(status_code=400, detail="A container can't be placed inside itself")
        if parent_id in seen:
            break
        seen.add(parent_id)
        parent = db.get(models.Container, parent_id)
        if parent is None:
            raise HTTPException(status_code=400, detail="Parent container does not exist")
        parent_id = parent.contained_in


@router.get("/", response_model=schemas.PaginatedResponse)
def get_containers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    q: Optional[str] = Query(None, description="Search name and description"),
    room_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Container)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(models.Container.name.ilike(like), models.Container.description.ilike(like)))
    if room_id is not None:
        query = query.filter(models.Container.room_id == room_id)

    total = query.count()
    containers = query.order_by(models.Container.name).offset(skip).limit(limit).all()
    counts = item_counts(db, [c.id for c in containers])
    return {
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "items": [container_to_dict(c, counts.get(c.id, 0)) for c in containers]
    }

@router.get("/{container_id}", response_model=schemas.ContainerDetail)
def get_container(container_id: int, db: Session = Depends(get_db)):
    db_container = db.get(models.Container, container_id)
    if db_container is None:
        raise HTTPException(status_code=404, detail="Container not found")

    items = (
        db.query(models.Item)
        .filter(models.Item.contained_in == container_id)
        .order_by(models.Item.name)
        .all()
    )
    children = (
        db.query(models.Container)
        .filter(models.Container.contained_in == container_id)
        .order_by(models.Container.name)
        .all()
    )
    counts = item_counts(db, [c.id for c in children])

    path = []
    parent = db_container.parent_container
    while parent is not None and len(path) < 50:
        path.insert(0, {"id": parent.id, "name": parent.name})
        parent = parent.parent_container

    data = container_to_dict(db_container, len(items))
    data["items"] = [schemas.Item.model_validate(i).model_dump(mode="json") for i in items]
    data["child_containers"] = [container_to_dict(c, counts.get(c.id, 0)) for c in children]
    data["path"] = path
    return data

@router.post("/", response_model=schemas.ContainerSummary)
def create_container(container: schemas.ContainerCreate, db: Session = Depends(get_db)):
    validate_container(db, container)
    db_container = models.Container(**container.model_dump())
    db.add(db_container)
    db.commit()
    db.refresh(db_container)
    return container_to_dict(db_container)

@router.put("/{container_id}", response_model=schemas.ContainerSummary)
def update_container(container_id: int, container: schemas.ContainerCreate, db: Session = Depends(get_db)):
    db_container = db.get(models.Container, container_id)
    if db_container is None:
        raise HTTPException(status_code=404, detail="Container not found")
    validate_container(db, container, container_id)

    old_image = db_container.image_path
    for key, value in container.model_dump().items():
        setattr(db_container, key, value)

    db.commit()
    if old_image != db_container.image_path:
        delete_image_if_unused(db, old_image)
    db.refresh(db_container)
    return container_to_dict(db_container, item_counts(db, [container_id]).get(container_id, 0))

@router.delete("/{container_id}")
def delete_container(container_id: int, db: Session = Depends(get_db)):
    db_container = db.get(models.Container, container_id)
    if db_container is None:
        raise HTTPException(status_code=404, detail="Container not found")

    # Whatever was inside moves up one level (or becomes unassigned)
    new_parent = db_container.contained_in
    moved_items = (
        db.query(models.Item)
        .filter(models.Item.contained_in == container_id)
        .update({models.Item.contained_in: new_parent}, synchronize_session=False)
    )
    moved_containers = (
        db.query(models.Container)
        .filter(models.Container.contained_in == container_id)
        .update({models.Container.contained_in: new_parent}, synchronize_session=False)
    )

    image_path = db_container.image_path
    db.delete(db_container)
    db.commit()
    delete_image_if_unused(db, image_path)
    return {
        "message": "Container deleted successfully",
        "moved_items": moved_items,
        "moved_containers": moved_containers,
    }
