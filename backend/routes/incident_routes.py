from fastapi import APIRouter, HTTPException
from database import create_incident, get_incidents, update_incident_status, get_incident_stats
from datetime import datetime, timedelta
import uuid
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class IncidentCreate(BaseModel):
    camera_id: str
    incident_type: str
    location: str
    severity: str = "medium"
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None

# register new incident
@router.post("/report")
async def report_incident(incident: IncidentCreate):
    incident_data = {
        "id": str(uuid.uuid4()),
        "camera_id": incident.camera_id,
        "incident_type": incident.incident_type,
        "location": incident.location,
        "severity": incident.severity,
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "description": incident.description or f"{incident.incident_type} detected at {incident.location}",
        "latitude": incident.latitude,
        "longitude": incident.longitude
    }

    created_incident = await create_incident(incident_data)
    return {"message": "Incident recorded successfully", "incident_id": created_incident["id"]}


# get all incidents
@router.get("/")
async def get_incidents_endpoint(status: Optional[str] = None, limit: Optional[int] = 100):
    incidents = await get_incidents(limit=limit, status=status)
    return {"incidents": incidents, "count": len(incidents)}


# update incident status
@router.patch("/{incident_id}/status")
async def update_incident_status_endpoint(incident_id: str, status: str):
    valid_statuses = ["active", "resolved", "false-alarm", "investigating"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    success = await update_incident_status(incident_id, status)
    if success:
        return {"message": "Incident status updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Incident not found")


# get incident statistics
@router.get("/stats/summary")
async def get_incident_stats_endpoint():
    """Get incident statistics"""
    stats = await get_incident_stats()
    return {
        "total_incidents": stats["total"],
        "active_incidents": stats["active"],
        "resolved_incidents": stats["resolved"],
        "false_alarms": stats["false_alarms"],
        "generated_at": datetime.now().isoformat()
    }