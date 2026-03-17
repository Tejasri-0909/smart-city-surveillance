#!/usr/bin/env python3
"""
Simplified Smart City Surveillance Backend for Render Deployment
Ultra-minimal dependencies, maximum compatibility
"""
import os
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables with fallbacks
MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://admin:Admin1234@cluster0.xkdu0rp.mongodb.net/")
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretkey")
PORT = int(os.getenv("PORT", 8000))

# MongoDB setup with error handling
try:
    client = AsyncIOMotorClient(MONGO_URL)
    database = client["smart_city_surveillance"]
    cameras_collection = database.cameras
    incidents_collection = database.incidents
    alerts_collection = database.alerts
    logger.info("✅ MongoDB client initialized")
except Exception as e:
    logger.error(f"❌ MongoDB initialization error: {e}")
    # Continue without database for basic functionality
    client = None
    database = None

# FastAPI app
app = FastAPI(
    title="Smart City Surveillance API",
    version="2.0.0",
    description="Simplified deployment version"
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

# Pydantic models
class IncidentCreate(BaseModel):
    camera_id: str
    incident_type: str
    location: str
    severity: str = "medium"
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

# Database initialization
async def init_database():
    """Initialize database with sample data if empty"""
    if not database:
        logger.warning("⚠️ Database not available, skipping initialization")
        return
        
    try:
        # Check if cameras exist
        camera_count = await cameras_collection.count_documents({})
        if camera_count == 0:
            sample_cameras = [
                {
                    "camera_id": "CAM001",
                    "location": "City Center",
                    "latitude": 40.7128,
                    "longitude": -74.0060,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771961/cam1_funvna.mp4"
                },
                {
                    "camera_id": "CAM002",
                    "location": "Metro Station",
                    "latitude": 40.7589,
                    "longitude": -73.9851,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771935/cam2_euevgq.mp4"
                },
                {
                    "camera_id": "CAM003",
                    "location": "Airport Gate",
                    "latitude": 40.6892,
                    "longitude": -74.1745,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771955/cam3_sug2zm.mp4"
                },
                {
                    "camera_id": "CAM004",
                    "location": "Shopping Mall",
                    "latitude": 40.7505,
                    "longitude": -73.9934,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771984/cam4_xexpfj.mp4"
                },
                {
                    "camera_id": "CAM005",
                    "location": "Park Entrance",
                    "latitude": 40.7829,
                    "longitude": -73.9654,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773773966/Cam5_gefgvz.mp4"
                },
                {
                    "camera_id": "CAM006",
                    "location": "Highway Bridge",
                    "latitude": 40.7282,
                    "longitude": -74.0776,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773774617/Cam6_bwq6kd.mp4"
                }
            ]
            await cameras_collection.insert_many(sample_cameras)
            logger.info("✅ Sample cameras inserted")

        # Check if incidents exist
        incident_count = await incidents_collection.count_documents({})
        if incident_count == 0:
            sample_incidents = [
                {
                    "id": "incident-001",
                    "camera_id": "CAM002",
                    "incident_type": "Suspicious Activity",
                    "location": "Metro Station",
                    "severity": "medium",
                    "status": "active",
                    "timestamp": datetime.now().isoformat(),
                    "latitude": 40.7589,
                    "longitude": -73.9851,
                    "description": "Suspicious behavior detected"
                },
                {
                    "id": "incident-002",
                    "camera_id": "CAM004",
                    "incident_type": "Weapon Detected",
                    "location": "Shopping Mall",
                    "severity": "critical",
                    "status": "active",
                    "timestamp": datetime.now().isoformat(),
                    "latitude": 40.7505,
                    "longitude": -73.9934,
                    "description": "Weapon detection alert"
                }
            ]
            await incidents_collection.insert_many(sample_incidents)
            logger.info("✅ Sample incidents inserted")

        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization error: {e}")
        # Continue without database initialization

# Startup event
@app.on_event("startup")
async def startup_event():
    await init_database()

# Routes
@app.get("/")
async def home():
    return {
        "message": "Smart City Surveillance Backend Running",
        "version": "2.0.0",
        "status": "operational",
        "deployment": "render-optimized"
    }

@app.get("/health")
async def health_check():
    try:
        if database:
            # Test database connection
            camera_count = await cameras_collection.count_documents({})
            incident_count = await incidents_collection.count_documents({})
            
            return {
                "status": "healthy",
                "database": "connected",
                "cameras": camera_count,
                "incidents": incident_count,
                "websocket_connections": len(websocket_connections),
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "status": "healthy",
                "database": "unavailable",
                "mode": "fallback",
                "websocket_connections": len(websocket_connections),
                "timestamp": datetime.now().isoformat()
            }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.get("/cameras")
async def get_cameras():
    if not database:
        # Return mock data if database unavailable
        return {
            "cameras": [
                {
                    "_id": "mock-1",
                    "camera_id": "CAM001",
                    "location": "City Center",
                    "latitude": 40.7128,
                    "longitude": -74.0060,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771961/cam1_funvna.mp4"
                },
                {
                    "_id": "mock-2",
                    "camera_id": "CAM002",
                    "location": "Metro Station",
                    "latitude": 40.7589,
                    "longitude": -73.9851,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771935/cam2_euevgq.mp4"
                }
            ]
        }
    
    try:
        cameras = []
        async for camera in cameras_collection.find({}):
            camera["_id"] = str(camera["_id"])
            cameras.append(camera)
        return {"cameras": cameras}
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/incidents")
async def get_incidents(limit: int = 10):
    if not database:
        # Return mock data if database unavailable
        return {
            "incidents": [
                {
                    "_id": "mock-incident-1",
                    "id": "incident-001",
                    "camera_id": "CAM002",
                    "incident_type": "Suspicious Activity",
                    "location": "Metro Station",
                    "severity": "medium",
                    "status": "active",
                    "timestamp": datetime.now().isoformat(),
                    "latitude": 40.7589,
                    "longitude": -73.9851,
                    "description": "Suspicious behavior detected"
                }
            ],
            "count": 1
        }
    
    try:
        incidents = []
        async for incident in incidents_collection.find({}).sort("timestamp", -1).limit(limit):
            incident["_id"] = str(incident["_id"])
            incidents.append(incident)
        return {"incidents": incidents, "count": len(incidents)}
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/incidents/report")
async def report_incident(incident: IncidentCreate):
    try:
        incident_data = {
            "id": f"incident-{datetime.now().timestamp()}",
            "camera_id": incident.camera_id,
            "incident_type": incident.incident_type,
            "location": incident.location,
            "severity": incident.severity,
            "status": "active",
            "timestamp": datetime.now().isoformat(),
            "description": incident.description or f"{incident.incident_type} at {incident.location}",
            "latitude": incident.latitude,
            "longitude": incident.longitude
        }
        
        result = await incidents_collection.insert_one(incident_data)
        incident_data["_id"] = str(result.inserted_id)
        
        # Broadcast to WebSocket connections
        await broadcast_to_websockets({
            "type": "incident",
            "data": incident_data
        })
        
        return {"message": "Incident reported successfully", "incident": incident_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.patch("/incidents/{incident_id}/status")
async def update_incident_status(incident_id: str, status: str):
    try:
        result = await incidents_collection.update_one(
            {"id": incident_id},
            {"$set": {"status": status, "updated_at": datetime.now().isoformat()}}
        )
        
        if result.modified_count > 0:
            return {"message": "Incident status updated successfully"}
        else:
            raise HTTPException(status_code=404, detail="Incident not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

async def broadcast_to_websockets(message: dict):
    """Broadcast message to all connected WebSocket clients"""
    if websocket_connections:
        message_text = json.dumps(message)
        for websocket in websocket_connections.copy():
            try:
                await websocket.send_text(message_text)
            except:
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