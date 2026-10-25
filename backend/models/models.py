from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    width = Column(Integer)
    length = Column(Integer)
    height = Column(Integer)

    containers = relationship("Container", back_populates="room")

class Container(Base):
    __tablename__ = "containers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    image_path = Column(String)
    # Position of the container inside its room (metres), used by the 3D view
    xCoor = Column(Integer)
    yCoor = Column(Integer)
    zCoor = Column(Integer)
    contained_in = Column(Integer, ForeignKey("containers.id"), nullable=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    parent_container = relationship("Container", remote_side=[id], backref="child_containers")
    room = relationship("Room", back_populates="containers")
    items = relationship("Item", back_populates="container")

class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    image_path = Column(String)
    quantity = Column(Integer, default=1)
    xCoor = Column(Integer)
    yCoor = Column(Integer)
    zCoor = Column(Integer)
    contained_in = Column(Integer, ForeignKey("containers.id"))
    created_at = Column(DateTime, default=utcnow)

    # Relationship
    container = relationship("Container", back_populates="items")
