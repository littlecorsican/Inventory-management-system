from fastapi import APIRouter, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
import models.models as models
import schemas.schemas as schemas
import os
import uuid
import base64
from setting.config import Config


router = APIRouter(
    prefix="/image",
    tags=["image"]
)

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "heic", "heif"}


def _save_bytes(data: bytes, extension: str) -> str:
    if len(data) > Config.maxUploadBytes:
        raise HTTPException(status_code=413, detail="Image is too large")

    os.makedirs(Config.mediaDir, exist_ok=True)
    newFilename = f"{uuid.uuid4()}.{extension}"
    with open(os.path.join(Config.mediaDir, newFilename), "wb") as f:
        f.write(data)

    # Always return a URL-style path (forward slashes) so it works on every OS
    return f"{Config.mediaUrlPrefix}/{newFilename}"


def delete_image_if_unused(db: Session, image_path: str | None, ignore_item_id=None, ignore_container_id=None):
    """Remove an uploaded file once no item or container points at it any more."""
    if not image_path or not image_path.startswith(f"{Config.mediaUrlPrefix}/"):
        return

    item_q = db.query(models.Item).filter(models.Item.image_path == image_path)
    if ignore_item_id is not None:
        item_q = item_q.filter(models.Item.id != ignore_item_id)
    container_q = db.query(models.Container).filter(models.Container.image_path == image_path)
    if ignore_container_id is not None:
        container_q = container_q.filter(models.Container.id != ignore_container_id)
    if item_q.count() or container_q.count():
        return

    filename = os.path.basename(image_path)
    file_path = os.path.join(Config.mediaDir, filename)
    try:
        os.remove(file_path)
    except FileNotFoundError:
        pass


@router.post("/uploadImage", response_model=schemas.ImageUploadResponse)
def uploadImage(file: UploadFile = File(...)):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files can be uploaded")

    fileExtension = (file.filename or "").rsplit(".", 1)[-1].lower()
    if fileExtension not in ALLOWED_EXTENSIONS:
        fileExtension = "jpg"

    return {"saved_path": _save_bytes(file.file.read(), fileExtension)}


@router.post("/uploadBase64", response_model=schemas.ImageUploadResponse)
def uploadBase64(request: schemas.Base64UploadRequest):
    base64Image = request.base64Image
    fileExtension = "png"
    if base64Image.startswith("data:image/jpeg"):
        fileExtension = "jpg"
    if "," in base64Image:
        base64Image = base64Image.split(",", 1)[1]

    try:
        data = base64.b64decode(base64Image, validate=True)
    except (ValueError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 data: {str(e)}")

    try:
        return {"saved_path": _save_bytes(data, fileExtension)}
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")
