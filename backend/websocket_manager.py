"""
WebSocket Manager for Real-time Alert Broadcasting
Handles WebSocket connections and alert distribution
"""

import json
import logging
from typing import List, Dict
from fastapi import WebSocket, WebSocketDisconnect
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_info: Dict[WebSocket, Dict] = {}

    async def connect(self, websocket: WebSocket, client_info: Dict = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if client_info:
            self.connection_info[websocket] = client_info
            
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
        
        # Send connection confirmation
        await self.send_personal_message({
            "type": "connection",
            "message": "Connected to Smart City Surveillance System",
            "timestamp": asyncio.get_event_loop().time()
        }, websocket)

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
        if websocket in self.connection_info:
            del self.connection_info[websocket]
            
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)

    async def broadcast_alert(self, alert: Dict):
        """Broadcast an alert to all connected clients"""
        if not self.active_connections:
            logger.warning("No active WebSocket connections for alert broadcast")
            return

        message = {
            "type": "alert",
            "data": alert,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        # Send to all connections
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
                logger.info(f"Alert broadcasted to connection")
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
            
        logger.info(f"Alert broadcasted to {len(self.active_connections)} connections")

    async def broadcast_incident_update(self, incident: Dict):
        """Broadcast incident status update to all connected clients"""
        if not self.active_connections:
            return

        message = {
            "type": "incident_update",
            "data": incident,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting incident update: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_camera_status(self, camera_status: Dict):
        """Broadcast camera status update to all connected clients"""
        if not self.active_connections:
            return

        message = {
            "type": "camera_status",
            "data": camera_status,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting camera status: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    async def send_system_message(self, message: str, message_type: str = "info"):
        """Send a system message to all connected clients"""
        if not self.active_connections:
            return

        system_message = {
            "type": "system",
            "message_type": message_type,
            "message": message,
            "timestamp": asyncio.get_event_loop().time()
        }
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(system_message))
            except Exception as e:
                logger.error(f"Error sending system message: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)

    def get_connection_info(self) -> List[Dict]:
        """Get information about all active connections"""
        return list(self.connection_info.values())

# Global WebSocket manager instance
websocket_manager = WebSocketManager()

# Convenience functions
async def broadcast_alert(alert: Dict):
    """Broadcast an alert to all connected clients"""
    await websocket_manager.broadcast_alert(alert)

async def broadcast_incident_update(incident: Dict):
    """Broadcast incident update to all connected clients"""
    await websocket_manager.broadcast_incident_update(incident)

async def broadcast_camera_status(camera_status: Dict):
    """Broadcast camera status to all connected clients"""
    await websocket_manager.broadcast_camera_status(camera_status)

async def send_system_message(message: str, message_type: str = "info"):
    """Send system message to all connected clients"""
    await websocket_manager.send_system_message(message, message_type)

def get_connection_count() -> int:
    """Get number of active WebSocket connections"""
    return websocket_manager.get_connection_count()