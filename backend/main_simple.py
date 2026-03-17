from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from routes.auth_routes import router as auth_router
from routes.camera_routes import router as camera_router
from routes.incident_routes import router as incident_router
from routes.realtime_routes import router as realtime_router
from database import init_database, get_incident_stats
from websocket_manager import websocket_manager
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Smart City Surveillance API", 
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket endpoint for real-time alerts
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            # Echo back for testing
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(camera_router, prefix="/cameras", tags=["Cameras"])
app.include_router(incident_router, prefix="/incidents", tags=["Incidents"])
app.include_router(realtime_router, prefix="/realtime", tags=["Real-time"])

@app.get("/", tags=["System"])
def home():
    return {
        "message": "Smart City Surveillance Backend Running",
        "version": "2.0.0",
        "status": "operational"
    }

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint"""
    try:
        stats = await get_incident_stats()
        from websocket_manager import get_connection_count
        
        return {
            "status": "healthy",
            "database": "connected",
            "websocket_connections": get_connection_count(),
            "incident_stats": stats,
            "timestamp": "2024-03-16T12:00:00Z"
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "error",
            "error": str(e)
        }

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    await init_database()
    logger.info("Database initialized")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)