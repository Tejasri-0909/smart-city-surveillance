from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from routes.auth_routes import router as auth_router
from routes.camera_routes import router as camera_router
from routes.incident_routes import router as incident_router
from routes.realtime_routes import router as realtime_router
from routes.video_routes import router as video_router
from routes.analytics_routes import router as analytics_router
from routes.map_routes import router as map_router
from database import init_database, get_incident_stats
from websocket_manager import websocket_manager, broadcast_alert
from camera_processor import initialize_camera_processor, start_camera_processing, stop_camera_processing
from camera_24_7_manager import initialize_24_7_cameras, stop_camera_24_7_monitoring
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
import json
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Alert callback for camera processor
async def handle_ai_alert(incident_data):
    """Handle AI-detected incidents"""
    try:
        # Store incident in database
        from database import create_incident, create_alert
        
        # Create incident record
        incident = await create_incident(incident_data)
        logger.info(f"Incident created: {incident}")
        
        # Create alert record
        alert_data = {
            "camera_id": incident_data["camera_id"],
            "incident_type": incident_data["incident_type"],
            "location": incident_data["location"],
            "message": incident_data.get("message", f"{incident_data['incident_type']} detected at {incident_data['location']}"),
            "severity": incident_data["severity"],
            "timestamp": incident_data["timestamp"]
        }
        alert = await create_alert(alert_data)
        
        # Broadcast alert via WebSocket
        await broadcast_alert(alert_data)
        logger.info(f"Alert broadcasted: {alert_data}")
        
    except Exception as e:
        logger.error(f"Error handling AI alert: {e}")

# Initialize camera processor with alert callback
camera_processor = initialize_camera_processor(handle_ai_alert)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for 24/7 operation"""
    # Startup
    try:
        logger.info("🚀 Starting Smart City Surveillance System (24/7 Mode)")
        
        # Initialize database
        await init_database()
        logger.info("✅ Database initialized")
        
        # Initialize 24/7 camera system
        await initialize_24_7_cameras()
        logger.info("✅ 24/7 Camera system initialized")
        
        # Start camera processing
        start_camera_processing()
        logger.info("✅ Camera processing started")
        
        logger.info("🌟 System ready for 24/7 operation")
        
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
    
    yield
    
    # Shutdown
    try:
        logger.info("🛑 Shutting down system...")
        stop_camera_processing()
        stop_camera_24_7_monitoring()
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

# Improved WebSocket endpoint for 24/7 operation
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Robust WebSocket endpoint for 24/7 operation"""
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
            "message": "Connected to Smart City Surveillance 24/7",
            "timestamp": datetime.now().isoformat(),
            "client_id": client_id
        }
        await websocket.send_text(json.dumps(welcome_msg))
        
        # Keep connection alive with heartbeat
        last_ping = datetime.now()
        
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
                        last_ping = datetime.now()
                        
                    elif msg_type == "heartbeat":
                        # Respond to heartbeat
                        heartbeat_msg = {
                            "type": "heartbeat_ack",
                            "timestamp": datetime.now().isoformat(),
                            "status": "alive"
                        }
                        await websocket.send_text(json.dumps(heartbeat_msg))
                        
                    else:
                        # Echo other messages
                        echo_msg = {
                            "type": "echo",
                            "original_message": message,
                            "timestamp": datetime.now().isoformat()
                        }
                        await websocket.send_text(json.dumps(echo_msg))
                        
                except json.JSONDecodeError:
                    # Handle non-JSON messages
                    error_msg = {
                        "type": "error",
                        "message": "Invalid JSON format",
                        "received": data,
                        "timestamp": datetime.now().isoformat()
                    }
                    await websocket.send_text(json.dumps(error_msg))
                    
            except asyncio.TimeoutError:
                # Send heartbeat if no message received
                now = datetime.now()
                if (now - last_ping).seconds > 60:  # Send heartbeat every minute
                    heartbeat_msg = {
                        "type": "heartbeat",
                        "timestamp": now.isoformat(),
                        "status": "alive"
                    }
                    await websocket.send_text(json.dumps(heartbeat_msg))
                    last_ping = now
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

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(camera_router, prefix="/cameras", tags=["Cameras"])
app.include_router(incident_router, prefix="/incidents", tags=["Incidents"])
app.include_router(realtime_router, prefix="/realtime", tags=["Real-time"])
app.include_router(video_router, prefix="/video", tags=["Video Analysis"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(map_router, prefix="/map", tags=["Map Data"])

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
            "AI Detection",
            "WebSocket Alerts"
        ]
    }

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint"""
    try:
        stats = await get_incident_stats()
        from websocket_manager import get_connection_count
        from camera_processor import get_camera_status
        
        return {
            "status": "healthy",
            "database": "connected",
            "websocket_connections": get_connection_count(),
            "camera_status": get_camera_status(),
            "incident_stats": stats,
            "timestamp": "2024-03-16T12:00:00Z"
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "error",
            "error": str(e)
        }

@app.get("/ai-status", tags=["System"])
def ai_status():
    """Get AI detection system status"""
    try:
        from ai_detection import get_detector_status
        return get_detector_status()
    except Exception as e:
        return {"error": str(e), "status": "unavailable"}

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