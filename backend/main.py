import os
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from database import migrate
from routers import items, containers, rooms, image, stats
from setting.config import Config


# Create database tables / add new columns
migrate()
os.makedirs(Config.mediaDir, exist_ok=True)

app = FastAPI(
    title="Inventory Management System",
    description="A FastAPI backend for managing inventory items, containers, and rooms",
    version="1.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configure CORS (only needed when the frontend runs on a different origin, e.g. `npm start`)
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.corsOrigins,
    allow_credentials="*" not in Config.corsOrigins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
api = APIRouter(prefix="/api")
api.include_router(items.router)
api.include_router(containers.router)
api.include_router(rooms.router)
api.include_router(image.router)
api.include_router(stats.router)

@api.get("/health")
def health():
    return {"status": "ok"}

app.include_router(api)

app.mount(f"/{Config.mediaUrlPrefix}", StaticFiles(directory=Config.mediaDir), name="media")


# Serve the built React app (single container deployment). Any unknown path falls back to
# index.html so client-side routes like /containers/3 work on refresh.
if os.path.isdir(Config.staticDir):
    index_file = os.path.join(Config.staticDir, "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        candidate = os.path.normpath(os.path.join(Config.staticDir, full_path))
        if full_path and candidate.startswith(Config.staticDir + os.sep) and os.path.isfile(candidate):
            return FileResponse(candidate)
        return FileResponse(index_file, headers={"Cache-Control": "no-cache"})
else:
    @app.get("/")
    def read_root():
        return {
            "message": "Welcome to the Inventory Management System API",
            "docs_url": "/api/docs",
            "redoc_url": "/api/redoc"
        }
