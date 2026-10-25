import os

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Config:
    # Everything that must survive a restart (database + uploaded photos) lives here.
    # In Docker this is a mounted volume (see Dockerfile / docker-compose.yml).
    dataDir = os.path.abspath(os.getenv("DATA_DIR", BACKEND_DIR))
    databasePath = os.path.join(dataDir, "inventory.db")

    # Folder on disk + URL prefix used to serve uploaded images
    mediaDir = os.path.join(dataDir, "media")
    mediaUrlPrefix = "media"
    maxUploadBytes = int(os.getenv("MAX_UPLOAD_MB", "15")) * 1024 * 1024

    # Built React app (served by FastAPI when present, e.g. inside the Docker image)
    staticDir = os.path.abspath(os.getenv("STATIC_DIR", os.path.join(BACKEND_DIR, "static")))

    corsOrigins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
