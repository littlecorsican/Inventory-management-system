from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, selectinload
from database import get_db
import models.models as models
import schemas.schemas as schemas

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"]
)

@router.get("/", response_model=schemas.PaginatedResponse)
def get_rooms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    total = db.query(models.Room).count()
    rooms = db.query(models.Room).order_by(models.Room.name).offset(skip).limit(limit).all()
    return {
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "items": [{"id": room.id, "name": room.name,
                  "width": room.width, "length": room.length,
                  "height": room.height} for room in rooms]
    }

@router.get("/{room_id}", response_model=schemas.Room)
def get_room(room_id: int, db: Session = Depends(get_db)):
    db_room = db.query(models.Room).options(selectinload(models.Room.containers)).filter(models.Room.id == room_id).first()
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_room

@router.post("/", response_model=schemas.Room)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    db_room = models.Room(**room.model_dump())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@router.put("/{room_id}", response_model=schemas.Room)
def update_room(room_id: int, room: schemas.RoomCreate, db: Session = Depends(get_db)):
    db_room = db.get(models.Room, room_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    for key, value in room.model_dump().items():
        setattr(db_room, key, value)

    db.commit()
    db.refresh(db_room)
    return db_room

@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    db_room = db.get(models.Room, room_id)
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    # Containers stay, they just no longer belong to a room
    db.query(models.Container).filter(models.Container.room_id == room_id).update(
        {models.Container.room_id: None}, synchronize_session=False
    )
    db.delete(db_room)
    db.commit()
    return {"message": "Room deleted successfully"}
