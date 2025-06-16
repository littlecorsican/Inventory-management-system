from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models.models as models
import schemas.schemas as schemas

router = APIRouter(
    prefix="/containers",
    tags=["containers"]
)

@router.get("/", response_model=schemas.PaginatedResponse)
def get_containers(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    total = db.query(models.Container).count()
    containers = db.query(models.Container).offset(skip).limit(limit).all()
    return {
        "total": total,
        "page": skip // limit + 1,
        "size": limit,
        "items": [{"id": container.id, "name": container.name, 
                  "description": container.description, 
                  "image_path": container.image_path,
                  "contained_in": container.contained_in,
                  "room_id": container.room_id} for container in containers]
    }

@router.get("/{container_id}")
def get_container(container_id: int, db: Session = Depends(get_db)):
    # Get the container
    db_container = db.query(models.Container).filter(models.Container.id == container_id).first()
    if db_container is None:
        raise HTTPException(status_code=404, detail="Container not found")
    
    # Get all items in this container
    items = db.query(models.Item).filter(models.Item.contained_in == container_id).all()
    
    # Convert container to dict
    container_dict = {
        "id": db_container.id,
        "name": db_container.name,
        "description": db_container.description,
        "image_path": db_container.image_path,
        "contained_in": db_container.contained_in,
        "room_id": db_container.room_id,
        "items": [
            {
                "id": item.id,
                "name": item.name,
                "description": item.description,
                "image_path": item.image_path,
                "xCoor": item.xCoor,
                "yCoor": item.yCoor,
                "zCoor": item.zCoor,
                "contained_in": item.contained_in
            } for item in items
        ]
    }
    
    return container_dict

@router.post("/", response_model=schemas.Container)
def create_container(container: schemas.ContainerCreate, db: Session = Depends(get_db)):
    db_container = models.Container(**container.model_dump())
    db.add(db_container)
    db.commit()
    db.refresh(db_container)
    return db_container

@router.put("/{container_id}", response_model=schemas.Container)
def update_container(container_id: int, container: schemas.ContainerCreate, db: Session = Depends(get_db)):
    db_container = db.query(models.Container).filter(models.Container.id == container_id).first()
    if db_container is None:
        raise HTTPException(status_code=404, detail="Container not found")
    
    for key, value in container.model_dump().items():
        setattr(db_container, key, value)
    
    db.commit()
    db.refresh(db_container)
    return db_container

@router.delete("/{container_id}")
def delete_container(container_id: int, db: Session = Depends(get_db)):
    db_container = db.query(models.Container).filter(models.Container.id == container_id).first()
    if db_container is None:
        raise HTTPException(status_code=404, detail="Container not found")
    
    db.delete(db_container)
    db.commit()
    return {"message": "Container deleted successfully"} 