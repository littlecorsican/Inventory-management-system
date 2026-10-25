from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
import models.models as models
import schemas.schemas as schemas
from routers.items import item_to_dict

router = APIRouter(
    prefix="/stats",
    tags=["stats"]
)

@router.get("/", response_model=schemas.Stats)
def get_stats(recent: int = Query(8, ge=0, le=50), db: Session = Depends(get_db)):
    recent_items = (
        db.query(models.Item)
        .options(joinedload(models.Item.container))
        .order_by(models.Item.id.desc())
        .limit(recent)
        .all()
    )
    return {
        "rooms": db.query(models.Room).count(),
        "containers": db.query(models.Container).count(),
        "items": db.query(models.Item).count(),
        "unassigned_items": db.query(models.Item).filter(models.Item.contained_in.is_(None)).count(),
        "recent_items": [item_to_dict(i) for i in recent_items],
    }
