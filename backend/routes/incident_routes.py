from fastapi import APIRouter
from database import incidents_collection
from datetime import datetime
import uuid

router = APIRouter()

# register new incident
@router.post("/report")
def report_incident(camera_id: str, incident_type: str, location: str, severity: str = "medium"):

    incident = {
        "id": str(uuid.uuid4()),
        "camera_id": camera_id,
        "incident_type": incident_type,
        "location": location,
        "severity": severity,
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "description": f"{incident_type} detected at {location}"
    }

    incidents_collection.insert_one(incident)

    return {"message": "Incident recorded successfully", "incident_id": incident["id"]}


# get all incidents
@router.get("/")
def get_incidents():

    incidents = list(incidents_collection.find({}, {"_id": 0}))

    return {"incidents": incidents}


# update incident status
@router.patch("/{incident_id}/status")
def update_incident_status(incident_id: str, status: str):
    
    result = incidents_collection.update_one(
        {"id": incident_id},
        {"$set": {"status": status, "updated_at": datetime.now().isoformat()}}
    )
    
    if result.modified_count > 0:
        return {"message": "Incident status updated successfully"}
    else:
        return {"message": "Incident not found"}, 404


# get incident by id
@router.get("/{incident_id}")
def get_incident(incident_id: str):
    
    incident = incidents_collection.find_one({"id": incident_id}, {"_id": 0})
    
    if incident:
        return {"incident": incident}
    else:
        return {"message": "Incident not found"}, 404