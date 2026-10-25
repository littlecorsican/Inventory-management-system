from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List

# Room Schemas
class RoomBase(BaseModel):
    name: str = Field(min_length=1)
    width: Optional[int] = None
    length: Optional[int] = None
    height: Optional[int] = None

class RoomCreate(RoomBase):
    pass


# Container Schemas
class ContainerBase(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = ""
    image_path: Optional[str] = None
    xCoor: Optional[int] = None
    yCoor: Optional[int] = None
    zCoor: Optional[int] = None
    contained_in: Optional[int] = None
    room_id: Optional[int] = None

class ContainerCreate(ContainerBase):
    pass

class Container(ContainerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[datetime] = None

class Room(RoomBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    containers: List[Container] = []

# Item Schemas
class ItemBase(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = ""
    image_path: Optional[str] = None
    quantity: int = Field(default=1, ge=0)
    contained_in: Optional[int] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quantity: Optional[int] = 1
    xCoor: Optional[int] = None
    yCoor: Optional[int] = None
    zCoor: Optional[int] = None
    created_at: Optional[datetime] = None

class ItemWithLocation(Item):
    container_name: Optional[str] = None

class ContainerSummary(Container):
    room_name: Optional[str] = None
    item_count: int = 0

class ContainerCrumb(BaseModel):
    id: int
    name: str

class ContainerDetail(ContainerSummary):
    items: List[Item] = []
    child_containers: List[ContainerSummary] = []
    # Parent chain from the outermost container down to the direct parent
    path: List[ContainerCrumb] = []

# Pagination Schemas
class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[dict]

class Stats(BaseModel):
    rooms: int
    containers: int
    items: int
    unassigned_items: int
    recent_items: List[ItemWithLocation]

class ImageUploadResponse(BaseModel):
    saved_path: str

class Base64UploadRequest(BaseModel):
    base64Image: str
