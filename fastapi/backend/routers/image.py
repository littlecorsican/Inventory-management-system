from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Body
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models.models as models
import schemas.schemas as schemas
import os
import shutil
import uuid
import base64
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


@router.post("/uploadBase64", response_model=schemas.ImageUploadResponse)
def uploadBase64(request: schemas.Base64UploadRequest):

    try:
        base64Image = request.base64Image
        fileExtension = "png"
        upload_dir = Config.mediaPath
        os.makedirs(upload_dir, exist_ok=True)
        
        newFilename = f"{uuid.uuid4()}.{fileExtension}"
        file_path = os.path.join(upload_dir, newFilename)
        
        if "," in base64Image:
            base64Image = base64Image.split(",")[1]
        
        # Decode and save the image
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(base64Image))
        
        return {"saved_path": file_path}
    
    except (ValueError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 data: {str(e)}")
    except IOError as e:
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")