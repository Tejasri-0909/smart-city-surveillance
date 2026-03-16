from fastapi import APIRouter, HTTPException
from database import cameras_collection
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
def get_cameras():

    cameras = list(cameras_collection.find({}, {"_id": 0}))
    
    return {"cameras": cameras}


@router.get("/{camera_id}")
def get_camera(camera_id: str):
    
    camera = cameras_collection.find_one({"camera_id": camera_id}, {"_id": 0})
    
    if camera:
        return {"camera": camera}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


@router.put("/{camera_id}")
def update_camera(camera_id: str, camera_update: CameraUpdate):
    
    update_data = {"updated_at": datetime.now().isoformat()}
    
    # Only update fields that are provided
    update_dict = camera_update.dict(exclude_unset=True)
    update_data.update(update_dict)
    
    result = cameras_collection.update_one(
        {"camera_id": camera_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        return {"message": "Camera updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


@router.patch("/{camera_id}/status")
def update_camera_status(camera_id: str, status: str):
    
    valid_statuses = ["active", "offline", "maintenance"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = cameras_collection.update_one(
        {"camera_id": camera_id},
        {"$set": {"status": status, "updated_at": datetime.now().isoformat()}}
    )
    
    if result.modified_count > 0:
        return {"message": "Camera status updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


@router.delete("/{camera_id}")
def delete_camera(camera_id: str):
    
    result = cameras_collection.delete_one({"camera_id": camera_id})
    
    if result.deleted_count > 0:
        return {"message": "Camera deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Camera not found")


@router.get("/location/nearby")
def get_nearby_cameras(latitude: float, longitude: float, radius_km: float = 5.0):
    """Get cameras within a specified radius of a location"""
    
    # Simple distance calculation (for production, use proper geospatial queries)
    cameras = list(cameras_collection.find({}, {"_id": 0}))
    
    nearby_cameras = []
    for camera in cameras:
        if camera.get("latitude") and camera.get("longitude"):
            # Simple distance approximation
            lat_diff = abs(camera["latitude"] - latitude)
            lng_diff = abs(camera["longitude"] - longitude)
            
            # Rough distance calculation (1 degree ≈ 111 km)
            distance = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111
            
            if distance <= radius_km:
                camera["distance_km"] = round(distance, 2)
                nearby_cameras.append(camera)
    
    return {"cameras": nearby_cameras, "count": len(nearby_cameras)}