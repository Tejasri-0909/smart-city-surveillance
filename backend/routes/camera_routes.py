from fastapi import APIRouter, HTTPException
from database import get_cameras, get_camera, update_camera_status
from datetime import datetime
import uuid
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class CameraCreate(BaseModel):
    camera_id: str
    location: str
    latitude: float
    longitude: float
    status: str = "active"
    stream_url: Optional[str] = ""

class CameraUpdate(BaseModel):
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    stream_url: Optional[str] = None

@router.post("/register")
def register_camera(camera: CameraCreate):

    # Check if camera already exists
    existing_camera = cameras_collection.find_one({"camera_id": camera.camera_id})
    if existing_camera:
        raise HTTPException(status_code=400, detail="Camera ID already exists")

    camera_doc = {
        "id": str(uuid.uuid4()),
        "camera_id": camera.camera_id,
        "location": camera.location,
        "latitude": camera.latitude,
        "longitude": camera.longitude,
        "status": camera.status,
        "stream_url": camera.stream_url,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    cameras_collection.insert_one(camera_doc)

    return {"message": "Camera registered successfully", "camera_id": camera.camera_id}
    

@router.get("/")
async def get_cameras_endpoint():
    cameras = await get_cameras()
    return {"cameras": cameras}


@router.get("/{camera_id}")
async def get_camera_endpoint(camera_id: str):
    camera = await get_camera(camera_id)
    if camera:
        return {"camera": camera}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


@router.patch("/{camera_id}/status")
async def update_camera_status_endpoint(camera_id: str, status: str):
    valid_statuses = ["active", "offline", "maintenance"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    success = await update_camera_status(camera_id, status)
    if success:
        return {"message": "Camera status updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")