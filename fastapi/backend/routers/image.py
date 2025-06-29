from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models.models as models
import schemas.schemas as schemas
import os
import shutil
import uuid
from setting.config import Config


router = APIRouter(
    prefix="/image",
    tags=["image"]
)


@router.post("/uploadImage", response_model=schemas.ImageUploadResponse)
def uploadImage(file: UploadFile = File(...)):
    upload_dir = Config.mediaPath
    os.makedirs(upload_dir, exist_ok=True)

    fileExtension = file.filename.split(".")[-1]
    newFilename = f"{uuid.uuid4()}.{fileExtension}"

    # Define file save path
    file_path = os.path.join(upload_dir, newFilename)

    # Copy the uploaded file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"saved_path": file_path}
