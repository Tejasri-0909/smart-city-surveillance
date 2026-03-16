from fastapi import APIRouter, HTTPException
from database import cameras_collection, incidents_collection
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/cameras-with-status")
def get_cameras_with_status():
    """Get all cameras with their current status and recent incident counts"""
    
    cameras = list(cameras_collection.find({}, {"_id": 0}))
    
    # Add recent incident counts for each camera
    for camera in cameras:
        # Get incidents from last 24 hours for this camera
        yesterday = datetime.now() - timedelta(hours=24)
        recent_incidents = list(incidents_collection.find({
            "camera_id": camera["camera_id"],
            "timestamp": {"$gte": yesterday.isoformat()}
        }))
        
        camera["recent_incidents"] = len(recent_incidents)
        camera["has_active_alerts"] = any(
            incident.get("status") == "active" for incident in recent_incidents
        )
    
    return {"cameras": cameras}


@router.get("/incidents-for-map")
def get_incidents_for_map(hours: int = 24, limit: int = 100):
    """Get incidents with location data for map display"""
    
    from_time = datetime.now() - timedelta(hours=hours)
    
    incidents = list(incidents_collection.find({
        "timestamp": {"$gte": from_time.isoformat()},
        "latitude": {"$exists": True, "$ne": None},
        "longitude": {"$exists": True, "$ne": None}
    }, {"_id": 0}).limit(limit))
    
    return {"incidents": incidents, "count": len(incidents)}


@router.get("/heatmap-data")
def get_heatmap_data(hours: int = 168):  # Default 7 days
    """Get incident data formatted for heatmap visualization"""
    
    from_time = datetime.now() - timedelta(hours=hours)
    
    incidents = list(incidents_collection.find({
        "timestamp": {"$gte": from_time.isoformat()},
        "latitude": {"$exists": True, "$ne": None},
        "longitude": {"$exists": True, "$ne": None}
    }, {"_id": 0}))
    
    # Group incidents by location and calculate intensity
    location_counts = {}
    
    for incident in incidents:
        # Round coordinates to create location clusters
        lat_key = round(incident["latitude"], 4)
        lng_key = round(incident["longitude"], 4)
        location_key = f"{lat_key},{lng_key}"
        
        if location_key not in location_counts:
            location_counts[location_key] = {
                "latitude": incident["latitude"],
                "longitude": incident["longitude"],
                "count": 0,
                "severity_weights": {"critical": 0, "high": 0, "medium": 0, "low": 0}
            }
        
        location_counts[location_key]["count"] += 1
        severity = incident.get("severity", "medium")
        location_counts[location_key]["severity_weights"][severity] += 1
    
    # Convert to heatmap format with intensity calculation
    heatmap_points = []
    max_count = max((loc["count"] for loc in location_counts.values()), default=1)
    
    for location_data in location_counts.values():
        # Calculate intensity based on count and severity
        base_intensity = location_data["count"] / max_count
        
        # Weight by severity
        severity_multiplier = (
            location_data["severity_weights"]["critical"] * 1.0 +
            location_data["severity_weights"]["high"] * 0.8 +
            location_data["severity_weights"]["medium"] * 0.6 +
            location_data["severity_weights"]["low"] * 0.4
        ) / max(location_data["count"], 1)
        
        intensity = min(base_intensity * (1 + severity_multiplier), 1.0)
        
        heatmap_points.append([
            location_data["latitude"],
            location_data["longitude"],
            intensity
        ])
    
    return {
        "heatmap_points": heatmap_points,
        "total_incidents": len(incidents),
        "time_period_hours": hours,
        "generated_at": datetime.now().isoformat()
    }


@router.get("/map-statistics")
def get_map_statistics():
    """Get overall statistics for the map dashboard"""
    
    # Get current counts
    total_cameras = cameras_collection.count_documents({})
    active_cameras = cameras_collection.count_documents({"status": "active"})
    offline_cameras = cameras_collection.count_documents({"status": "offline"})
    
    # Get incident counts for different time periods
    now = datetime.now()
    last_hour = now - timedelta(hours=1)
    last_24h = now - timedelta(hours=24)
    last_week = now - timedelta(days=7)
    
    incidents_last_hour = incidents_collection.count_documents({
        "timestamp": {"$gte": last_hour.isoformat()}
    })
    
    incidents_last_24h = incidents_collection.count_documents({
        "timestamp": {"$gte": last_24h.isoformat()}
    })
    
    incidents_last_week = incidents_collection.count_documents({
        "timestamp": {"$gte": last_week.isoformat()}
    })
    
    active_incidents = incidents_collection.count_documents({"status": "active"})
    
    return {
        "cameras": {
            "total": total_cameras,
            "active": active_cameras,
            "offline": offline_cameras,
            "uptime_percentage": (active_cameras / total_cameras * 100) if total_cameras > 0 else 0
        },
        "incidents": {
            "last_hour": incidents_last_hour,
            "last_24h": incidents_last_24h,
            "last_week": incidents_last_week,
            "active": active_incidents
        },
        "generated_at": now.isoformat()
    }


@router.post("/simulate-incident-on-map")
def simulate_incident_on_map(camera_id: str = "CAM002"):
    """Simulate an incident for testing map functionality"""
    
    # Get camera location
    camera = cameras_collection.find_one({"camera_id": camera_id}, {"_id": 0})
    
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    # Create simulated incident
    incident_types = ["Weapon Detected", "Suspicious Activity", "Fire Detected", "Unauthorized Access"]
    severities = ["critical", "high", "medium", "low"]
    
    incident = {
        "id": f"sim_{int(datetime.now().timestamp())}",
        "camera_id": camera_id,
        "incident_type": random.choice(incident_types),
        "location": camera["location"],
        "severity": random.choice(severities),
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "latitude": camera["latitude"],
        "longitude": camera["longitude"],
        "description": f"Simulated incident at {camera['location']}"
    }
    
    incidents_collection.insert_one(incident)
    
    return {
        "message": "Incident simulated successfully",
        "incident": {k: v for k, v in incident.items() if k != "_id"}
    }