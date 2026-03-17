from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/summary")
async def get_analytics_summary(time_range: str = "7d"):
    """Get analytics summary for dashboard"""
    
    # Import database functions locally to avoid import issues
    try:
        from database import get_incidents, get_cameras
        
        # Get incidents and cameras
        incidents = await get_incidents(limit=1000)
        cameras = await get_cameras()
        
        # Calculate date range
        end_date = datetime.now()
        if time_range == "24h":
            start_date = end_date - timedelta(hours=24)
        elif time_range == "7d":
            start_date = end_date - timedelta(days=7)
        elif time_range == "30d":
            start_date = end_date - timedelta(days=30)
        elif time_range == "90d":
            start_date = end_date - timedelta(days=90)
        else:
            start_date = end_date - timedelta(days=7)
        
        # Filter incidents by date range
        filtered_incidents = [
            inc for inc in incidents 
            if datetime.fromisoformat(inc.get('timestamp', '2024-01-01T00:00:00')) >= start_date
        ]
        
        # Calculate metrics
        total_incidents = len(filtered_incidents)
        active_incidents = len([i for i in filtered_incidents if i.get("status") == "active"])
        resolved_incidents = len([i for i in filtered_incidents if i.get("status") == "resolved"])
        false_alarms = len([i for i in filtered_incidents if i.get("status") == "false-alarm"])
        
        # Calculate camera uptime
        total_cameras = len(cameras)
        active_cameras = len([c for c in cameras if c.get("status") == "active"])
        system_uptime = (active_cameras / total_cameras * 100) if total_cameras > 0 else 0
        
        # Calculate average response time (simulated)
        avg_response_time = random.uniform(1.5, 3.5)
        
        # Calculate false alarm rate
        false_alarm_rate = (false_alarms / total_incidents * 100) if total_incidents > 0 else 0
        
        return {
            "summary": {
                "total_incidents": total_incidents,
                "active_incidents": active_incidents,
                "resolved_incidents": resolved_incidents,
                "false_alarms": false_alarms,
                "avg_response_time": f"{avg_response_time:.1f} min",
                "system_uptime": round(system_uptime, 1),
                "false_alarm_rate": round(false_alarm_rate, 1)
            },
            "time_range": time_range,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        # Return fallback data if database is unavailable
        return {
            "summary": {
                "total_incidents": 25,
                "active_incidents": 3,
                "resolved_incidents": 20,
                "false_alarms": 2,
                "avg_response_time": "2.1 min",
                "system_uptime": 98.5,
                "false_alarm_rate": 8.0
            },
            "time_range": time_range,
            "generated_at": datetime.now().isoformat(),
            "note": "Using fallback data"
        }


@router.get("/incidents-by-type")
def get_incidents_by_type(time_range: str = "7d"):
    """Get incident distribution by type"""
    
    # In a real implementation, query database with date filters
    # For demo, return simulated data
    
    incident_types = [
        {"name": "Weapon Detected", "value": 15, "color": "#ff4444"},
        {"name": "Suspicious Activity", "value": 32, "color": "#ffaa00"},
        {"name": "Fire Detected", "value": 8, "color": "#ff6600"},
        {"name": "Unauthorized Access", "value": 12, "color": "#aa44ff"}
    ]
    
    return {"incidents_by_type": incident_types}


@router.get("/incidents-by-location")
def get_incidents_by_location(time_range: str = "7d"):
    """Get incident distribution by location"""
    
    # Get cameras to use their locations
    cameras = list(cameras_collection.find({}, {"_id": 0}))
    
    # Simulate incident counts per location
    locations = []
    for camera in cameras:
        incident_count = random.randint(3, 25)
        locations.append({
            "location": camera.get("location", "Unknown"),
            "camera_id": camera.get("camera_id"),
            "incidents": incident_count,
            "latitude": camera.get("latitude"),
            "longitude": camera.get("longitude")
        })
    
    return {"incidents_by_location": locations}


@router.get("/incidents-over-time")
def get_incidents_over_time(time_range: str = "7d"):
    """Get incident trends over time"""
    
    # Generate time series data based on range
    end_date = datetime.now()
    data_points = []
    
    if time_range == "24h":
        # Hourly data for last 24 hours
        for i in range(24):
            timestamp = end_date - timedelta(hours=23-i)
            incidents = random.randint(0, 5)
            data_points.append({
                "timestamp": timestamp.strftime("%H:00"),
                "incidents": incidents
            })
    elif time_range == "7d":
        # Daily data for last 7 days
        for i in range(7):
            timestamp = end_date - timedelta(days=6-i)
            incidents = random.randint(3, 15)
            data_points.append({
                "timestamp": timestamp.strftime("%Y-%m-%d"),
                "incidents": incidents
            })
    elif time_range == "30d":
        # Daily data for last 30 days (sample every 3 days)
        for i in range(0, 30, 3):
            timestamp = end_date - timedelta(days=29-i)
            incidents = random.randint(5, 25)
            data_points.append({
                "timestamp": timestamp.strftime("%m-%d"),
                "incidents": incidents
            })
    
    return {"incidents_over_time": data_points}


@router.get("/camera-performance")
def get_camera_performance():
    """Get camera performance metrics"""
    
    cameras = list(cameras_collection.find({}, {"_id": 0}))
    
    performance_data = []
    for camera in cameras:
        # Simulate performance metrics
        uptime = random.uniform(85, 99.5)
        incident_count = random.randint(2, 20)
        
        performance_data.append({
            "camera_id": camera.get("camera_id"),
            "location": camera.get("location"),
            "uptime": round(uptime, 1),
            "incidents": incident_count,
            "status": camera.get("status", "active"),
            "last_maintenance": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
        })
    
    return {"camera_performance": performance_data}


@router.get("/system-health")
def get_system_health():
    """Get overall system health metrics"""
    
    cameras = list(cameras_collection.find({}, {"_id": 0}))
    incidents = list(incidents_collection.find({}, {"_id": 0}))
    
    total_cameras = len(cameras)
    active_cameras = len([c for c in cameras if c.get("status") == "active"])
    offline_cameras = len([c for c in cameras if c.get("status") == "offline"])
    
    # Simulate additional metrics
    cpu_usage = random.uniform(15, 85)
    memory_usage = random.uniform(40, 90)
    disk_usage = random.uniform(25, 75)
    network_latency = random.uniform(5, 50)
    
    return {
        "system_health": {
            "cameras": {
                "total": total_cameras,
                "active": active_cameras,
                "offline": offline_cameras,
                "uptime_percentage": (active_cameras / total_cameras * 100) if total_cameras > 0 else 0
            },
            "resources": {
                "cpu_usage": round(cpu_usage, 1),
                "memory_usage": round(memory_usage, 1),
                "disk_usage": round(disk_usage, 1),
                "network_latency": round(network_latency, 1)
            },
            "incidents": {
                "total": len(incidents),
                "active": len([i for i in incidents if i.get("status") == "active"]),
                "resolved_today": len([i for i in incidents if i.get("status") == "resolved"])
            }
        }
    }