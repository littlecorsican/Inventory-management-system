from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models.models as models
from routers import items, containers, rooms

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory Management System",
    description="A FastAPI backend for managing inventory items, containers, and rooms",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(items.router)
app.include_router(containers.router)
app.include_router(rooms.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Inventory Management System API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    } 