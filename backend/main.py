from fastapi import FastAPI
from routes.auth_routes import router as auth_router
from routes.camera_routes import router as camera_router
from routes.incident_routes import router as incident_router
from routes.realtime_routes import router as realtime_router
from routes.video_routes import router as video_router
from routes.analytics_routes import router as analytics_router
from routes.map_routes import router as map_router
from database import db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Smart City Surveillance API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            "AI Detection"
        ]
    }

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": "2024-03-16T12:00:00Z"
    }

@app.get("/test-db", tags=["System"])
def test_db():
    return {"collections": db.list_collection_names()}