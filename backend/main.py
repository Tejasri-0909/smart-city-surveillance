from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from routes.auth_routes import router as auth_router
from routes.camera_routes import router as camera_router
from routes.incident_routes import router as incident_router
from routes.realtime_routes import router as realtime_router
from database import init_database, get_incident_stats
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
import json
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simple WebSocket manager
class SimpleWebSocketManager:
    def __init__(self):
        self.active_connections = []
    
    async def connect(self, websocket: WebSocket):
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    def get_connection_count(self):
        return len(self.active_connections)
    
    async def broadcast(self, message: dict):
        if self.active_connections:
            for connection in self.active_connections.copy():
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    self.disconnect(connection)

websocket_manager = SimpleWebSocketManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    try:
        logger.info("🚀 Starting Smart City Surveillance System")
        
        # Initialize database
        await init_database()
        logger.info("✅ Database initialized")
        
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

app = FastAPI(
    title="Smart City Surveillance API", 
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    client_id = f"client_{datetime.now().timestamp()}"
    
    try:
        # Accept connection
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
                # Wait for message with timeout
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                
                try:
                    message = json.loads(data)
                    msg_type = message.get("type", "unknown")
                    
                    if msg_type == "ping":
                        # Respond to ping
                        pong_msg = {
                            "type": "pong",
                            "timestamp": datetime.now().isoformat(),
                            "client_id": client_id
                        }
                        await websocket.send_text(json.dumps(pong_msg))
                        
                    elif msg_type == "heartbeat":
                        # Respond to heartbeat
                        heartbeat_msg = {
                            "type": "heartbeat_ack",
                            "timestamp": datetime.now().isoformat(),
                            "status": "alive"
                        }
                        await websocket.send_text(json.dumps(heartbeat_msg))
                        
                except json.JSONDecodeError:
                    # Handle non-JSON messages
                    error_msg = {
                        "type": "error",
                        "message": "Invalid JSON format",
                        "timestamp": datetime.now().isoformat()
                    }
                    await websocket.send_text(json.dumps(error_msg))
                    
            except asyncio.TimeoutError:
                # Send heartbeat if no message received
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

# Include core routers only
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(camera_router, prefix="/cameras", tags=["Cameras"])
app.include_router(incident_router, prefix="/incidents", tags=["Incidents"])
app.include_router(realtime_router, prefix="/realtime", tags=["Real-time"])

# Include optional routers with error handling
try:
    from routes.video_routes import router as video_router
    app.include_router(video_router, prefix="/video", tags=["Video Analysis"])
except ImportError:
    logger.warning("Video routes not available")

try:
    from routes.analytics_routes import router as analytics_router
    app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
except ImportError:
    logger.warning("Analytics routes not available")

try:
    from routes.map_routes import router as map_router
    app.include_router(map_router, prefix="/map", tags=["Map Data"])
except ImportError:
    logger.warning("Map routes not available")

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
            "WebSocket Communication"
        ]
    }

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint"""
    try:
        stats = await get_incident_stats()
        
        return {
            "status": "healthy",
            "database": "connected",
            "websocket_connections": websocket_manager.get_connection_count(),
            "incident_stats": stats,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Render deployment entry point
if __name__ == "__main__":
    import uvicorn
    import os
    
    # Get port from environment (Render sets this)
    port = int(os.environ.get("PORT", 8000))
    
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False  # Disable reload for production
    )