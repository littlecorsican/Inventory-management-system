from pydantic import BaseModel
from typing import Optional, List

# Room Schemas
class RoomBase(BaseModel):
    name: str
    width: Optional[int]
    length: Optional[int]
    height: Optional[int]

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
    image_path: Optional[str]
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
    image_path: Optional[str]
    xCoor: Optional[int]
    yCoor: Optional[int]
    zCoor: Optional[int]
    contained_in: Optional[int]

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