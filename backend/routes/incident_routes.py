from fastapi import APIRouter, HTTPException
from database import incidents_collection, cameras_collection
from datetime import datetime
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
def report_incident(incident: IncidentCreate):

    # Get camera location if coordinates not provided
    camera = cameras_collection.find_one({"camera_id": incident.camera_id}, {"_id": 0})
    
    incident_doc = {
        "id": str(uuid.uuid4()),
        "camera_id": incident.camera_id,
        "incident_type": incident.incident_type,
        "location": incident.location,
        "severity": incident.severity,
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "description": incident.description or f"{incident.incident_type} detected at {incident.location}",
        "latitude": incident.latitude or (camera.get("latitude") if camera else None),
        "longitude": incident.longitude or (camera.get("longitude") if camera else None),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }

    incidents_collection.insert_one(incident_doc)

    return {"message": "Incident recorded successfully", "incident_id": incident_doc["id"]}


# get all incidents
@router.get("/")
def get_incidents(status: Optional[str] = None, severity: Optional[str] = None, limit: Optional[int] = None):

    query = {}
    if status:
        query["status"] = status
    if severity:
        query["severity"] = severity

    incidents_cursor = incidents_collection.find(query, {"_id": 0})
    
    if limit:
        incidents_cursor = incidents_cursor.limit(limit)
    
    incidents = list(incidents_cursor.sort("timestamp", -1))

    return {"incidents": incidents, "count": len(incidents)}


# update incident status
@router.patch("/{incident_id}/status")
def update_incident_status(incident_id: str, status: str):
    
    valid_statuses = ["active", "resolved", "false-alarm", "investigating"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = incidents_collection.update_one(
        {"id": incident_id},
        {"$set": {"status": status, "updated_at": datetime.now().isoformat()}}
    )
    
    if result.modified_count > 0:
        return {"message": "Incident status updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Incident not found")


# get incident by id
@router.get("/{incident_id}")
def get_incident(incident_id: str):
    
    incident = incidents_collection.find_one({"id": incident_id}, {"_id": 0})
    
    if incident:
        return {"incident": incident}
    else:
        raise HTTPException(status_code=404, detail="Incident not found")


# update incident
@router.put("/{incident_id}")
def update_incident(incident_id: str, incident_update: IncidentUpdate):
    
    update_data = {"updated_at": datetime.now().isoformat()}
    
    # Only update fields that are provided
    update_dict = incident_update.dict(exclude_unset=True)
    update_data.update(update_dict)
    
    result = incidents_collection.update_one(
        {"id": incident_id},
        {"$set": update_data}
    )
    
    if result.modified_count > 0:
        return {"message": "Incident updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Incident not found")


# get incidents by location
@router.get("/location/nearby")
def get_nearby_incidents(latitude: float, longitude: float, radius_km: float = 5.0, hours: int = 24):
    """Get incidents within a specified radius and time range"""
    
    # Calculate time range
    from_time = datetime.now() - datetime.timedelta(hours=hours)
    
    # Get incidents within time range
    incidents = list(incidents_collection.find({
        "timestamp": {"$gte": from_time.isoformat()}
    }, {"_id": 0}))
    
    nearby_incidents = []
    for incident in incidents:
        if incident.get("latitude") and incident.get("longitude"):
            # Simple distance calculation
            lat_diff = abs(incident["latitude"] - latitude)
            lng_diff = abs(incident["longitude"] - longitude)
            
            # Rough distance calculation (1 degree ≈ 111 km)
            distance = ((lat_diff ** 2 + lng_diff ** 2) ** 0.5) * 111
            
            if distance <= radius_km:
                incident["distance_km"] = round(distance, 2)
                nearby_incidents.append(incident)
    
    return {"incidents": nearby_incidents, "count": len(nearby_incidents)}


# get incident statistics
@router.get("/stats/summary")
def get_incident_stats(hours: int = 24):
    """Get incident statistics for the specified time period"""
    
    from_time = datetime.now() - datetime.timedelta(hours=hours)
    
    # Get incidents within time range
    incidents = list(incidents_collection.find({
        "timestamp": {"$gte": from_time.isoformat()}
    }, {"_id": 0}))
    
    # Calculate statistics
    total = len(incidents)
    by_status = {}
    by_severity = {}
    by_type = {}
    
    for incident in incidents:
        # Count by status
        status = incident.get("status", "unknown")
        by_status[status] = by_status.get(status, 0) + 1
        
        # Count by severity
        severity = incident.get("severity", "unknown")
        by_severity[severity] = by_severity.get(severity, 0) + 1
        
        # Count by type
        incident_type = incident.get("incident_type", "unknown")
        by_type[incident_type] = by_type.get(incident_type, 0) + 1
    
    return {
        "total_incidents": total,
        "time_period_hours": hours,
        "by_status": by_status,
        "by_severity": by_severity,
        "by_type": by_type,
        "generated_at": datetime.now().isoformat()
    }