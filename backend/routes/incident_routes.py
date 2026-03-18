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


# update incident status with real-time broadcasting
@router.patch("/{incident_id}/status")
async def update_incident_status_endpoint(incident_id: str, status: str):
    valid_statuses = ["active", "resolved", "false-alarm", "investigating"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    success = await update_incident_status(incident_id, status)
    if success:
        # Get updated incident data for response
        from database import get_incidents
        incidents = await get_incidents(limit=1000)
        updated_incident = next((inc for inc in incidents if inc.get("id") == incident_id or inc.get("_id") == incident_id), None)
        
        return {
            "message": "Incident status updated successfully",
            "incident": updated_incident,
            "timestamp": datetime.now().isoformat()
        }
    else:
        raise HTTPException(status_code=404, detail="Incident not found")

# Bulk update incidents
@router.patch("/bulk-update")
async def bulk_update_incidents(updates: list[dict]):
    """Update multiple incidents at once"""
    results = []
    
    for update in updates:
        incident_id = update.get("incident_id")
        status = update.get("status")
        
        if not incident_id or not status:
            results.append({"incident_id": incident_id, "success": False, "error": "Missing incident_id or status"})
            continue
            
        success = await update_incident_status(incident_id, status)
        results.append({"incident_id": incident_id, "success": success})
    
    return {
        "message": "Bulk update completed",
        "results": results,
        "timestamp": datetime.now().isoformat()
    }

# Real-time incident feed endpoint
@router.get("/live-feed")
async def get_live_incident_feed():
    """Get recent incidents for live feed"""
    # Get incidents from last 24 hours
    recent_incidents = await get_incidents(limit=50)
    
    # Filter for recent incidents (last 24 hours)
    cutoff_time = datetime.now() - timedelta(hours=24)
    live_incidents = []
    
    for incident in recent_incidents:
        try:
            incident_time = datetime.fromisoformat(incident.get("timestamp", "2024-01-01T00:00:00"))
            if incident_time >= cutoff_time:
                live_incidents.append(incident)
        except:
            # Include incident if timestamp parsing fails
            live_incidents.append(incident)
    
    return {
        "incidents": live_incidents,
        "count": len(live_incidents),
        "last_updated": datetime.now().isoformat()
    }


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