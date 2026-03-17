from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from typing import Dict, List, Optional
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    logger.warning("python-dotenv not available, using environment variables directly")

# MongoDB connection with fail-safe
MONGODB_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
DATABASE_NAME = "smart_city_surveillance"

# Global variables for database connection
client = None
database = None
cameras_collection = None
incidents_collection = None
alerts_collection = None
users_collection = None

async def init_database():
    """Initialize database connection with fail-safe"""
    global client, database, cameras_collection, incidents_collection, alerts_collection, users_collection
    
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        database = client[DATABASE_NAME]
        
        # Initialize collections
        cameras_collection = database.cameras
        incidents_collection = database.incidents
        alerts_collection = database.alerts
        users_collection = database.users
        
        # Test the connection
        await cameras_collection.count_documents({})
        logger.info("✅ Database initialized successfully")
        
        # Seed default data if collections are empty
        await seed_default_data()
        
    except Exception as e:
        logger.error(f"❌ Database initialization error: {e}")
        logger.info("📱 Running in fallback mode without database")
        # Set collections to None to trigger fallback mode
        cameras_collection = None
        incidents_collection = None
        alerts_collection = None
        users_collection = None

async def seed_default_data():
    """Seed default camera and user data if collections are empty"""
    try:
        if cameras_collection and await cameras_collection.count_documents({}) == 0:
            default_cameras = [
                {
                    "camera_id": "CAM001",
                    "location": "City Center",
                    "latitude": 40.7128,
                    "longitude": -74.0060,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771961/cam1_funvna.mp4",
                    "created_at": datetime.utcnow()
                },
                {
                    "camera_id": "CAM002",
                    "location": "Metro Station",
                    "latitude": 40.7589,
                    "longitude": -73.9851,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771935/cam2_euevgq.mp4",
                    "created_at": datetime.utcnow()
                },
                {
                    "camera_id": "CAM003",
                    "location": "Airport Gate",
                    "latitude": 40.6892,
                    "longitude": -74.1745,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771955/cam3_sug2zm.mp4",
                    "created_at": datetime.utcnow()
                },
                {
                    "camera_id": "CAM004",
                    "location": "Shopping Mall",
                    "latitude": 40.7505,
                    "longitude": -73.9934,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771984/cam4_xexpfj.mp4",
                    "created_at": datetime.utcnow()
                },
                {
                    "camera_id": "CAM005",
                    "location": "Park Entrance",
                    "latitude": 40.7829,
                    "longitude": -73.9654,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773773966/Cam5_gefgvz.mp4",
                    "created_at": datetime.utcnow()
                },
                {
                    "camera_id": "CAM006",
                    "location": "Highway Bridge",
                    "latitude": 40.7282,
                    "longitude": -74.0776,
                    "status": "active",
                    "stream_url": "https://res.cloudinary.com/dybci4h1u/video/upload/v1773774617/Cam6_bwq6kd.mp4",
                    "created_at": datetime.utcnow()
                }
            ]
            await cameras_collection.insert_many(default_cameras)
            logger.info("✅ Default cameras seeded")
            
        # Seed default user
        if users_collection and await users_collection.count_documents({}) == 0:
            from passlib.context import CryptContext
            pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            
            default_user = {
                "username": "admin",
                "hashed_password": pwd_context.hash("admin@123"),
                "email": "admin@smartcity.com",
                "is_active": True,
                "created_at": datetime.utcnow()
            }
            await users_collection.insert_one(default_user)
            logger.info("✅ Default admin user created")
            
    except Exception as e:
        logger.error(f"❌ Error seeding default data: {e}")

# Fallback data for when database is unavailable
def get_fallback_cameras():
    """Return fallback camera data"""
    return [
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

def get_fallback_incidents():
    """Return fallback incident data"""
    return [
        {
            "id": "fallback-1",
            "_id": "fallback-1",
            "camera_id": "CAM002",
            "location": "Metro Station",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "incident_type": "Suspicious Activity",
            "severity": "medium",
            "status": "active",
            "timestamp": datetime.now().isoformat(),
            "description": "Suspicious behavior detected at metro entrance"
        },
        {
            "id": "fallback-2",
            "_id": "fallback-2",
            "camera_id": "CAM004",
            "location": "Shopping Mall",
            "latitude": 40.7505,
            "longitude": -73.9934,
            "incident_type": "Weapon Detected",
            "severity": "critical",
            "status": "active",
            "timestamp": datetime.now().isoformat(),
            "description": "Weapon detection alert in main corridor"
        }
    ]

# Camera operations with fallback
async def get_cameras():
    """Get all cameras with fallback"""
    try:
        if cameras_collection:
            cameras = []
            async for camera in cameras_collection.find({}):
                camera["_id"] = str(camera["_id"])
                cameras.append(camera)
            return cameras
        else:
            return get_fallback_cameras()
    except Exception as e:
        logger.error(f"Error getting cameras: {e}")
        return get_fallback_cameras()

async def get_camera(camera_id: str):
    """Get a specific camera with fallback"""
    try:
        if cameras_collection:
            camera = await cameras_collection.find_one({"camera_id": camera_id})
            if camera:
                camera["_id"] = str(camera["_id"])
            return camera
        else:
            fallback_cameras = get_fallback_cameras()
            return next((cam for cam in fallback_cameras if cam["camera_id"] == camera_id), None)
    except Exception as e:
        logger.error(f"Error getting camera {camera_id}: {e}")
        fallback_cameras = get_fallback_cameras()
        return next((cam for cam in fallback_cameras if cam["camera_id"] == camera_id), None)

async def update_camera_status(camera_id: str, status: str):
    """Update camera status with fallback"""
    try:
        if cameras_collection:
            result = await cameras_collection.update_one(
                {"camera_id": camera_id},
                {"$set": {"status": status, "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        else:
            logger.info(f"Fallback mode: Camera {camera_id} status would be updated to {status}")
            return True
    except Exception as e:
        logger.error(f"Error updating camera status: {e}")
        return False

# Incident operations with fallback
async def create_incident(incident_data: Dict):
    """Create a new incident with fallback"""
    try:
        if incidents_collection:
            incident_data["created_at"] = datetime.utcnow()
            incident_data["updated_at"] = datetime.utcnow()
            
            result = await incidents_collection.insert_one(incident_data)
            incident_data["_id"] = str(result.inserted_id)
            return incident_data
        else:
            incident_data["_id"] = f"fallback-{datetime.now().timestamp()}"
            incident_data["created_at"] = datetime.utcnow()
            logger.info(f"Fallback mode: Incident created {incident_data['_id']}")
            return incident_data
    except Exception as e:
        logger.error(f"Error creating incident: {e}")
        incident_data["_id"] = f"fallback-{datetime.now().timestamp()}"
        return incident_data

async def get_incidents(limit: int = 100, status: Optional[str] = None):
    """Get incidents with fallback"""
    try:
        if incidents_collection:
            query = {}
            if status:
                query["status"] = status
                
            incidents = []
            async for incident in incidents_collection.find(query).sort("created_at", -1).limit(limit):
                incident["_id"] = str(incident["_id"])
                
                if "id" not in incident:
                    incident["id"] = incident["_id"]
                
                if "created_at" in incident:
                    incident["timestamp"] = incident["created_at"].isoformat()
                elif "timestamp" in incident and isinstance(incident["timestamp"], datetime):
                    incident["timestamp"] = incident["timestamp"].isoformat()
                    
                incident.setdefault("status", "active")
                incident.setdefault("severity", "medium")
                incident.setdefault("camera_id", "CAM001")
                incident.setdefault("incident_type", "Unknown")
                incident.setdefault("location", "Unknown Location")
                incident.setdefault("latitude", 40.7128)
                incident.setdefault("longitude", -74.006)
                
                incidents.append(incident)
            
            return incidents
        else:
            return get_fallback_incidents()
    except Exception as e:
        logger.error(f"Error getting incidents: {e}")
        return get_fallback_incidents()

async def update_incident_status(incident_id: str, status: str):
    """Update incident status with fallback"""
    try:
        if incidents_collection:
            from bson import ObjectId
            from bson.errors import InvalidId
            
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
                    logger.warning(f"Invalid incident ID format: {incident_id}")
                    return False
            
            success = result.modified_count > 0
            if success:
                logger.info(f"✅ Updated incident {incident_id} status to {status}")
            else:
                logger.warning(f"❌ Incident {incident_id} not found")
                
            return success
        else:
            logger.info(f"Fallback mode: Incident {incident_id} status would be updated to {status}")
            return True
    except Exception as e:
        logger.error(f"Error updating incident status: {e}")
        return False

async def get_incident_stats():
    """Get incident statistics with fallback"""
    try:
        if incidents_collection:
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
        else:
            return {
                "total": 2,
                "active": 2,
                "resolved": 0,
                "false_alarms": 0
            }
    except Exception as e:
        logger.error(f"Error getting incident stats: {e}")
        return {
            "total": 0,
            "active": 0,
            "resolved": 0,
            "false_alarms": 0
        }

# Alert operations with fallback
async def create_alert(alert_data: Dict):
    """Create a new alert with fallback"""
    try:
        if alerts_collection:
            alert_data["created_at"] = datetime.utcnow()
            result = await alerts_collection.insert_one(alert_data)
            alert_data["_id"] = str(result.inserted_id)
            return alert_data
        else:
            alert_data["_id"] = f"fallback-alert-{datetime.now().timestamp()}"
            logger.info(f"Fallback mode: Alert created {alert_data['_id']}")
            return alert_data
    except Exception as e:
        logger.error(f"Error creating alert: {e}")
        alert_data["_id"] = f"fallback-alert-{datetime.now().timestamp()}"
        return alert_data

async def get_recent_alerts(limit: int = 50):
    """Get recent alerts with fallback"""
    try:
        if alerts_collection:
            alerts = []
            async for alert in alerts_collection.find({}).sort("created_at", -1).limit(limit):
                alert["_id"] = str(alert["_id"])
                if "created_at" in alert:
                    alert["timestamp"] = alert["created_at"].isoformat()
                alerts.append(alert)
            return alerts
        else:
            return []
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        return []

# User operations with fallback
async def get_user(username: str):
    """Get user by username with fallback"""
    try:
        if users_collection:
            user = await users_collection.find_one({"username": username})
            if user:
                user["_id"] = str(user["_id"])
            return user
        else:
            # Fallback admin user
            if username == "admin":
                from passlib.context import CryptContext
                pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                return {
                    "_id": "fallback-admin",
                    "username": "admin",
                    "hashed_password": pwd_context.hash("admin@123"),
                    "email": "admin@smartcity.com",
                    "is_active": True
                }
            return None
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        return None

async def create_user(user_data: Dict):
    """Create a new user with fallback"""
    try:
        if users_collection:
            user_data["created_at"] = datetime.utcnow()
            result = await users_collection.insert_one(user_data)
            user_data["_id"] = str(result.inserted_id)
            return user_data
        else:
            user_data["_id"] = f"fallback-user-{datetime.now().timestamp()}"
            logger.info(f"Fallback mode: User created {user_data['_id']}")
            return user_data
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        user_data["_id"] = f"fallback-user-{datetime.now().timestamp()}"
        return user_data