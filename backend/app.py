#!/usr/bin/env python3
"""
ABSOLUTE MINIMAL Smart City Backend - NO EXTERNAL DEPENDENCIES
"""
import os
import json
from datetime import datetime
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Environment variables
PORT = int(os.getenv("PORT", 8000))

# In-memory storage (no database dependencies)
cameras_data = [
    {
        "id": "CAM001",
        "camera_id": "CAM001",
        "location": "City Center",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "status": "active",
        "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771961/cam1_funvna.mp4"
    },
    {
        "id": "CAM002",
        "camera_id": "CAM002",
        "location": "Metro Station",
        "latitude": 40.7589,
        "longitude": -73.9851,
        "status": "active",
        "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771935/cam2_euevgq.mp4"
    },
    {
        "id": "CAM003",
        "camera_id": "CAM003",
        "location": "Airport Gate",
        "latitude": 40.6892,
        "longitude": -74.1745,
        "status": "active",
        "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771955/cam3_sug2zm.mp4"
    },
    {
        "id": "CAM004",
        "camera_id": "CAM004",
        "location": "Shopping Mall",
        "latitude": 40.7505,
        "longitude": -73.9934,
        "status": "active",
        "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771984/cam4_xexpfj.mp4"
    },
    {
        "id": "CAM005",
        "camera_id": "CAM005",
        "location": "Park Entrance",
        "latitude": 40.7829,
        "longitude": -73.9654,
        "status": "active",
        "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773773966/Cam5_gefgvz.mp4"
    },
    {
        "id": "CAM006",
        "camera_id": "CAM006",
        "location": "Highway Bridge",
        "latitude": 40.7282,
        "longitude": -74.0776,
        "status": "active",
        "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773774617/Cam6_bwq6kd.mp4"
    }
]

incidents_data = [
    {
        "id": "incident-001",
        "_id": "incident-001",
        "camera_id": "CAM002",
        "incident_type": "Suspicious Activity",
        "location": "Metro Station",
        "severity": "medium",
        "status": "active",
        "timestamp": "2024-03-16T12:00:00Z",
        "latitude": 40.7589,
        "longitude": -73.9851,
        "description": "Suspicious behavior detected"
    },
    {
        "id": "incident-002",
        "_id": "incident-002",
        "camera_id": "CAM004",
        "incident_type": "Weapon Detected",
        "location": "Shopping Mall",
        "severity": "critical",
        "status": "active",
        "timestamp": "2024-03-16T11:30:00Z",
        "latitude": 40.7505,
        "longitude": -73.9934,
        "description": "Weapon detection alert"
    },
    {
        "id": "incident-003",
        "_id": "incident-003",
        "camera_id": "CAM001",
        "incident_type": "Crowd Gathering",
        "location": "City Center",
        "severity": "low",
        "status": "active",
        "timestamp": "2024-03-16T11:00:00Z",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "description": "Large crowd detected"
    }
]

# FastAPI app
app = FastAPI(
    title="Smart City Surveillance API",
    version="3.0.0",
    description="Minimal deployment version - NO DEPENDENCIES"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket connections
websocket_connections: List[WebSocket] = []

# Routes
@app.get("/")
def home():
    return {
        "message": "Smart City Surveillance Backend Running",
        "version": "3.0.0",
        "status": "operational",
        "deployment": "render-minimal-success"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "in-memory",
        "cameras": len(cameras_data),
        "incidents": len(incidents_data),
        "websocket_connections": len(websocket_connections),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/cameras")
def get_cameras():
    return {"cameras": cameras_data}

@app.get("/incidents")
def get_incidents(limit: int = 10):
    return {"incidents": incidents_data[:limit], "count": len(incidents_data)}

@app.post("/incidents/report")
def report_incident(incident: dict):
    new_incident = {
        "id": f"incident-{len(incidents_data) + 1}",
        "_id": f"incident-{len(incidents_data) + 1}",
        "camera_id": incident.get("camera_id", "CAM001"),
        "incident_type": incident.get("incident_type", "Unknown"),
        "location": incident.get("location", "Unknown Location"),
        "severity": incident.get("severity", "medium"),
        "status": "active",
        "timestamp": datetime.now().isoformat(),
        "description": incident.get("description", "New incident reported"),
        "latitude": incident.get("latitude", 40.7128),
        "longitude": incident.get("longitude", -74.0060)
    }
    incidents_data.append(new_incident)
    return {"message": "Incident reported successfully", "incident": new_incident}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.append(websocket)
    
    try:
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "connection",
            "message": "Connected to Smart City Surveillance",
            "timestamp": datetime.now().isoformat()
        }))
        
        while True:
            data = await websocket.receive_text()
            # Echo back
            await websocket.send_text(json.dumps({
                "type": "echo",
                "message": f"Received: {data}",
                "timestamp": datetime.now().isoformat()
            }))
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=PORT,
        log_level="info"
    )