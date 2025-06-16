from pydantic import BaseModel
from typing import Optional, List

# Room Schemas
class RoomBase(BaseModel):
    name: str
    width: int
    length: int
    height: int

class RoomCreate(RoomBase):
    pass

class Room(RoomBase):
    id: int

    class Config:
        from_attributes = True

# Container Schemas
class ContainerBase(BaseModel):
    name: str
    description: str
    image_path: str
    contained_in: Optional[int] = None
    room_id: Optional[int] = None

class ContainerCreate(ContainerBase):
    pass

class Container(ContainerBase):
    id: int

    class Config:
        from_attributes = True

# Item Schemas
class ItemBase(BaseModel):
    name: str
    description: str
    image_path: str
    xCoor: int
    yCoor: int
    zCoor: int
    contained_in: int

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        from_attributes = True

# Pagination Schemas
class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[dict] 