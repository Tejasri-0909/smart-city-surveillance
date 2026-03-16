from fastapi import APIRouter, HTTPException
from database import cameras_collection
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/register")
def register_camera(camera_id: str, location: str, latitude: float, longitude: float, status: str = "active", stream_url: str = ""):

    # Check if camera already exists
    existing_camera = cameras_collection.find_one({"camera_id": camera_id})
    if existing_camera:
        raise HTTPException(status_code=400, detail="Camera ID already exists")

    camera = {
        "id": str(uuid.uuid4()),
        "camera_id": camera_id,
        "location": location,
        "latitude": latitude,
        "longitude": longitude,
        "status": status,
        "stream_url": stream_url,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    cameras_collection.insert_one(camera)

    return {"message": "Camera registered successfully", "camera_id": camera_id}
    

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
def update_camera(camera_id: str, location: str = None, latitude: float = None, longitude: float = None, status: str = None, stream_url: str = None):
    
    update_data = {"updated_at": datetime.now().isoformat()}
    
    if location is not None:
        update_data["location"] = location
    if latitude is not None:
        update_data["latitude"] = latitude
    if longitude is not None:
        update_data["longitude"] = longitude
    if status is not None:
        update_data["status"] = status
    if stream_url is not None:
        update_data["stream_url"] = stream_url
    
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