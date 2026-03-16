from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)

manager = ConnectionManager()

@router.websocket("/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            
            # Echo back or process the message
            try:
                message_data = json.loads(data)
                
                # If it's an alert broadcast, send to all clients
                if message_data.get("type") == "alert":
                    await manager.broadcast(data)
                else:
                    # Echo back to sender
                    await manager.send_personal_message(data, websocket)
                    
            except json.JSONDecodeError:
                # If not JSON, just echo back
                await manager.send_personal_message(data, websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.post("/broadcast-alert")
async def broadcast_alert(
    alert_type: str,
    camera_id: str,
    location: str,
    severity: str = "medium",
    message: str = None
):
    """Broadcast an alert to all connected WebSocket clients"""
    
    alert_data = {
        "type": "alert",
        "alert_type": alert_type,
        "camera_id": camera_id,
        "location": location,
        "severity": severity,
        "message": message or f"{alert_type} detected at {location}",
        "timestamp": datetime.now().isoformat()
    }
    
    await manager.broadcast(json.dumps(alert_data))
    
    return {"message": "Alert broadcasted successfully", "alert": alert_data}


@router.post("/broadcast-camera-status")
async def broadcast_camera_status(camera_id: str, status: str, location: str = None):
    """Broadcast camera status change to all connected clients"""
    
    status_data = {
        "type": "camera_status",
        "camera_id": camera_id,
        "status": status,
        "location": location,
        "timestamp": datetime.now().isoformat()
    }
    
    await manager.broadcast(json.dumps(status_data))
    
    return {"message": "Camera status broadcasted successfully", "status": status_data}


@router.post("/broadcast-incident")
async def broadcast_incident(
    incident_id: str,
    camera_id: str,
    incident_type: str,
    location: str,
    severity: str,
    latitude: float = None,
    longitude: float = None
):
    """Broadcast new incident to all connected clients"""
    
    incident_data = {
        "type": "incident",
        "incident_id": incident_id,
        "camera_id": camera_id,
        "incident_type": incident_type,
        "location": location,
        "severity": severity,
        "latitude": latitude,
        "longitude": longitude,
        "timestamp": datetime.now().isoformat()
    }
    
    await manager.broadcast(json.dumps(incident_data))
    
    return {"message": "Incident broadcasted successfully", "incident": incident_data}


@router.get("/connections")
async def get_active_connections():
    """Get the number of active WebSocket connections"""
    return {
        "active_connections": len(manager.active_connections),
        "timestamp": datetime.now().isoformat()
    }


# Simulate real-time alerts for demo purposes
@router.post("/simulate-alert")
async def simulate_alert(alert_type: str = "weapon_detected"):
    """Simulate an alert for testing purposes"""
    
    import random
    
    alert_types = {
        "weapon_detected": {
            "camera_id": "CAM002",
            "location": "Metro Station",
            "severity": "high",
            "message": "Weapon detected at Metro Station"
        },
        "fire_detected": {
            "camera_id": "CAM001", 
            "location": "City Center",
            "severity": "critical",
            "message": "Fire detected at City Center"
        },
        "suspicious_activity": {
            "camera_id": "CAM003",
            "location": "Airport Gate", 
            "severity": "medium",
            "message": "Suspicious activity detected at Airport Gate"
        }
    }
    
    alert_config = alert_types.get(alert_type, alert_types["weapon_detected"])
    
    return await broadcast_alert(
        alert_type=alert_type.replace("_", " ").title(),
        **alert_config
    )