from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging
import json
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Enhanced WebSocket manager for real-time updates
class WebSocketManager:
    def __init__(self):
        self.active_connections = []
        self.connection_info = {}  # Store connection metadata
    
    async def connect(self, websocket: WebSocket, client_id: str = None):
        self.active_connections.append(websocket)
        if client_id:
            self.connection_info[websocket] = {"client_id": client_id, "subscriptions": []}
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.connection_info:
            del self.connection_info[websocket]
    
    def get_connection_count(self):
        return len(self.active_connections)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        if self.active_connections:
            for connection in self.active_connections.copy():
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    self.disconnect(connection)
    
    async def broadcast_incident_update(self, incident_data: dict):
        """Broadcast incident updates to all clients"""
        message = {
            "type": "incident_update",
            "data": incident_data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_camera_update(self, camera_data: dict):
        """Broadcast camera status updates to all clients"""
        message = {
            "type": "camera_update", 
            "data": camera_data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_alert(self, alert_data: dict):
        """Broadcast new alerts to all clients"""
        message = {
            "type": "new_alert",
            "data": alert_data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)
    
    async def broadcast_stats_update(self, stats_data: dict):
        """Broadcast statistics updates to all clients"""
        message = {
            "type": "stats_update",
            "data": stats_data,
            "timestamp": datetime.now().isoformat()
        }
        await self.broadcast(message)

websocket_manager = WebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    try:
        logger.info("🚀 Starting Smart City Surveillance System")
        
        # Initialize database with fail-safe
        try:
            from database import init_database
            await init_database()
            logger.info("✅ Database initialized")
        except Exception as e:
            logger.warning(f"⚠️ Database initialization failed: {e}")
            logger.info("📱 Running in fallback mode")
        
        logger.info("🌟 System ready")
        
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
    
    yield
    
    # Shutdown
    try:
        logger.info("🛑 Shutting down system...")
        logger.info("✅ System shutdown complete")
    except Exception as e:
        logger.error(f"❌ Shutdown error: {e}")

# Create FastAPI app instance
app = FastAPI(
    title="Smart City Surveillance API", 
    version="2.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Health endpoint (required)
@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    client_id = f"client_{datetime.now().timestamp()}"
    
    try:
        await websocket.accept()
        await websocket_manager.connect(websocket)
        
        logger.info(f"✅ WebSocket client {client_id} connected. Total: {websocket_manager.get_connection_count()}")
        
        # Send welcome message
        welcome_msg = {
            "type": "connection",
            "status": "connected",
            "message": "Connected to Smart City Surveillance",
            "timestamp": datetime.now().isoformat(),
            "client_id": client_id
        }
        await websocket.send_text(json.dumps(welcome_msg))
        
        # Keep connection alive
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                
                try:
                    message = json.loads(data)
                    msg_type = message.get("type", "unknown")
                    
                    if msg_type == "ping":
                        pong_msg = {
                            "type": "pong",
                            "timestamp": datetime.now().isoformat(),
                            "client_id": client_id
                        }
                        await websocket.send_text(json.dumps(pong_msg))
                        
                    elif msg_type == "heartbeat":
                        heartbeat_msg = {
                            "type": "heartbeat_ack",
                            "timestamp": datetime.now().isoformat(),
                            "status": "alive"
                        }
                        await websocket.send_text(json.dumps(heartbeat_msg))
                        
                except json.JSONDecodeError:
                    error_msg = {
                        "type": "error",
                        "message": "Invalid JSON format",
                        "timestamp": datetime.now().isoformat()
                    }
                    await websocket.send_text(json.dumps(error_msg))
                    
            except asyncio.TimeoutError:
                heartbeat_msg = {
                    "type": "heartbeat",
                    "timestamp": datetime.now().isoformat(),
                    "status": "alive"
                }
                await websocket.send_text(json.dumps(heartbeat_msg))
                continue
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"❌ WebSocket message error for {client_id}: {e}")
                break
                
    except Exception as e:
        logger.error(f"❌ WebSocket connection error for {client_id}: {e}")
    finally:
        websocket_manager.disconnect(websocket)
        logger.info(f"🔌 WebSocket client {client_id} disconnected. Total: {websocket_manager.get_connection_count()}")

# Include routers with error handling
try:
    from routes.auth_routes import router as auth_router
    app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
except ImportError as e:
    logger.warning(f"Auth routes not available: {e}")

try:
    from routes.camera_routes import router as camera_router
    app.include_router(camera_router, prefix="/cameras", tags=["Cameras"])
except ImportError as e:
    logger.warning(f"Camera routes not available: {e}")

try:
    from routes.incident_routes import router as incident_router
    app.include_router(incident_router, prefix="/incidents", tags=["Incidents"])
except ImportError as e:
    logger.warning(f"Incident routes not available: {e}")

try:
    from routes.realtime_routes import router as realtime_router
    app.include_router(realtime_router, prefix="/realtime", tags=["Real-time"])
except ImportError as e:
    logger.warning(f"Realtime routes not available: {e}")

try:
    from routes.video_routes import router as video_router
    app.include_router(video_router, prefix="/video", tags=["Video Analysis"])
except ImportError as e:
    logger.warning(f"Video routes not available: {e}")

try:
    from routes.analytics_routes import router as analytics_router
    app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
except ImportError as e:
    logger.warning(f"Analytics routes not available: {e}")

try:
    from routes.map_routes import router as map_router
    app.include_router(map_router, prefix="/map", tags=["Map Data"])
except ImportError as e:
    logger.warning(f"Map routes not available: {e}")

@app.get("/", tags=["System"])
def home():
    return {
        "message": "Smart City Surveillance Backend Running",
        "version": "2.0.0",
        "status": "operational",
        "features": [
            "Camera Management",
            "Incident Tracking", 
            "Real-time Alerts",
            "Video Analysis",
            "Analytics Dashboard",
            "WebSocket Communication"
        ]
    }

@app.get("/status", tags=["System"])
async def status():
    """Extended status endpoint"""
    try:
        from database import get_incident_stats
        stats = await get_incident_stats()
        
        return {
            "status": "healthy",
            "database": "connected",
            "websocket_connections": websocket_manager.get_connection_count(),
            "incident_stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Status check error: {e}")
        return {
            "status": "partial",
            "database": "unavailable",
            "websocket_connections": websocket_manager.get_connection_count(),
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Deployment entry point
if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment (Railway/Render sets this)
    port = int(os.environ.get("PORT", 8000))
    
    # Run the application
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False
    )