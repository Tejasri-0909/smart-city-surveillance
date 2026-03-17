from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGO_URL", "mongodb+srv://username:password@cluster.mongodb.net/")
DATABASE_NAME = "smart_city_surveillance"

client = AsyncIOMotorClient(MONGODB_URL)
database = client[DATABASE_NAME]

# Collections
cameras_collection = database.cameras
incidents_collection = database.incidents
alerts_collection = database.alerts
users_collection = database.users

async def init_database():
    """Initialize database connection"""
    try:
        # Just test the connection, don't add default data
        await cameras_collection.count_documents({})
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")

# Camera operations
async def get_cameras():
    """Get all cameras"""
    cameras = []
    async for camera in cameras_collection.find({}):
        camera["_id"] = str(camera["_id"])
        cameras.append(camera)
    return cameras

async def get_camera(camera_id: str):
    """Get a specific camera"""
    camera = await cameras_collection.find_one({"camera_id": camera_id})
    if camera:
        camera["_id"] = str(camera["_id"])
    return camera

async def update_camera_status(camera_id: str, status: str):
    """Update camera status"""
    result = await cameras_collection.update_one(
        {"camera_id": camera_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    return result.modified_count > 0

# Incident operations
async def create_incident(incident_data: Dict):
    """Create a new incident"""
    incident_data["created_at"] = datetime.utcnow()
    incident_data["updated_at"] = datetime.utcnow()
    
    result = await incidents_collection.insert_one(incident_data)
    incident_data["_id"] = str(result.inserted_id)
    return incident_data

async def get_incidents(limit: int = 100, status: Optional[str] = None):
    """Get incidents with optional filtering"""
    query = {}
    if status:
        query["status"] = status
        
    incidents = []
    async for incident in incidents_collection.find(query).sort("created_at", -1).limit(limit):
        # Convert MongoDB ObjectId to string
        incident["_id"] = str(incident["_id"])
        
        # Ensure consistent ID field - prefer custom 'id' over '_id'
        if "id" not in incident:
            incident["id"] = incident["_id"]
        
        # Convert datetime to ISO string for JSON serialization
        if "created_at" in incident:
            incident["timestamp"] = incident["created_at"].isoformat()
        elif "timestamp" in incident and isinstance(incident["timestamp"], datetime):
            incident["timestamp"] = incident["timestamp"].isoformat()
            
        # Ensure all required fields exist with defaults
        incident.setdefault("status", "active")
        incident.setdefault("severity", "medium")
        incident.setdefault("camera_id", "CAM001")
        incident.setdefault("incident_type", "Unknown")
        incident.setdefault("location", "Unknown Location")
        incident.setdefault("latitude", 40.7128)
        incident.setdefault("longitude", -74.006)
        
        incidents.append(incident)
    
    print(f"📊 Retrieved {len(incidents)} incidents from database")
    return incidents

async def update_incident_status(incident_id: str, status: str):
    """Update incident status - handles both custom IDs and MongoDB ObjectIds"""
    from bson import ObjectId
    from bson.errors import InvalidId
    
    try:
        # First try to find by custom 'id' field
        result = await incidents_collection.update_one(
            {"id": incident_id},
            {"$set": {"status": status, "updated_at": datetime.utcnow()}}
        )
        
        # If no document was updated, try with MongoDB ObjectId
        if result.modified_count == 0:
            try:
                result = await incidents_collection.update_one(
                    {"_id": ObjectId(incident_id)},
                    {"$set": {"status": status, "updated_at": datetime.utcnow()}}
                )
            except InvalidId:
                # If it's not a valid ObjectId, the incident doesn't exist
                print(f"Invalid incident ID format: {incident_id}")
                return False
        
        success = result.modified_count > 0
        if success:
            print(f"✅ Updated incident {incident_id} status to {status}")
        else:
            print(f"❌ Incident {incident_id} not found")
            
        return success
    except Exception as e:
        print(f"Error updating incident status: {e}")
        return False

async def get_incident_stats():
    """Get incident statistics"""
    total = await incidents_collection.count_documents({})
    active = await incidents_collection.count_documents({"status": "active"})
    resolved = await incidents_collection.count_documents({"status": "resolved"})
    false_alarms = await incidents_collection.count_documents({"status": "false-alarm"})
    
    return {
        "total": total,
        "active": active, 
        "resolved": resolved,
        "false_alarms": false_alarms
    }

# Alert operations
async def create_alert(alert_data: Dict):
    """Create a new alert"""
    alert_data["created_at"] = datetime.utcnow()
    result = await alerts_collection.insert_one(alert_data)
    alert_data["_id"] = str(result.inserted_id)
    return alert_data

async def get_recent_alerts(limit: int = 50):
    """Get recent alerts"""
    alerts = []
    async for alert in alerts_collection.find({}).sort("created_at", -1).limit(limit):
        alert["_id"] = str(alert["_id"])
        if "created_at" in alert:
            alert["timestamp"] = alert["created_at"].isoformat()
        alerts.append(alert)
    return alerts

# User operations (for authentication)
async def get_user(username: str):
    """Get user by username"""
    user = await users_collection.find_one({"username": username})
    if user:
        user["_id"] = str(user["_id"])
    return user

async def create_user(user_data: Dict):
    """Create a new user"""
    user_data["created_at"] = datetime.utcnow()
    result = await users_collection.insert_one(user_data)
    user_data["_id"] = str(result.inserted_id)
    return user_data