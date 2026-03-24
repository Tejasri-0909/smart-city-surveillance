from datetime import datetime, timedelta
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

# Try to import motor with fallback
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    MOTOR_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Motor not available: {e}")
    MOTOR_AVAILABLE = False

async def init_database():
    """Initialize database connection with fail-safe"""
    global client, database, cameras_collection, incidents_collection, alerts_collection, users_collection
    
    if not MOTOR_AVAILABLE:
        logger.warning("Motor/MongoDB not available, running in fallback mode")
        return
    
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
            try:
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
            except ImportError:
                logger.warning("Passlib not available, skipping user creation")
            
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
    """Return fallback incident data with 9 diverse incidents"""
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
        },
        {
            "id": "fallback-3",
            "_id": "fallback-3",
            "camera_id": "CAM001",
            "location": "City Center",
            "latitude": 40.7128,
            "longitude": -74.006,
            "incident_type": "Fire Detected",
            "severity": "high",
            "status": "resolved",
            "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
            "description": "Fire alarm triggered - resolved by emergency services"
        },
        {
            "id": "fallback-4",
            "_id": "fallback-4",
            "camera_id": "CAM003",
            "location": "Airport Gate",
            "latitude": 40.6892,
            "longitude": -74.1745,
            "incident_type": "Unattended Baggage",
            "severity": "medium",
            "status": "investigating",
            "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(),
            "description": "Unattended luggage detected at security checkpoint"
        },
        {
            "id": "fallback-5",
            "_id": "fallback-5",
            "camera_id": "CAM005",
            "location": "Park Entrance",
            "latitude": 40.7829,
            "longitude": -73.9654,
            "incident_type": "Vandalism",
            "severity": "low",
            "status": "active",
            "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat(),
            "description": "Graffiti activity detected on park property"
        },
        {
            "id": "fallback-6",
            "_id": "fallback-6",
            "camera_id": "CAM006",
            "location": "Highway Bridge",
            "latitude": 40.7282,
            "longitude": -74.0776,
            "incident_type": "Traffic Violation",
            "severity": "medium",
            "status": "active",
            "timestamp": (datetime.now() - timedelta(minutes=10)).isoformat(),
            "description": "Speeding vehicle detected exceeding limit by 25mph"
        },
        {
            "id": "fallback-7",
            "_id": "fallback-7",
            "camera_id": "CAM001",
            "location": "City Center",
            "latitude": 40.7128,
            "longitude": -74.006,
            "incident_type": "Crowd Gathering",
            "severity": "medium",
            "status": "active",
            "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(),
            "description": "Large crowd gathering detected - monitoring for safety"
        },
        {
            "id": "fallback-8",
            "_id": "fallback-8",
            "camera_id": "CAM002",
            "location": "Metro Station",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "incident_type": "Medical Emergency",
            "severity": "high",
            "status": "resolved",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "description": "Person collapsed on platform - emergency services responded"
        },
        {
            "id": "fallback-9",
            "_id": "fallback-9",
            "camera_id": "CAM004",
            "location": "Shopping Mall",
            "latitude": 40.7505,
            "longitude": -73.9934,
            "incident_type": "Theft Alert",
            "severity": "medium",
            "status": "false-alarm",
            "timestamp": (datetime.now() - timedelta(hours=1, minutes=30)).isoformat(),
            "description": "Shoplifting alert triggered - determined to be false alarm"
        }
    ]

# Camera operations with fallback
async def get_cameras():
    """Get all cameras - always includes the 6 permanent surveillance cameras"""
    # Always start with the 6 permanent cameras that are part of the surveillance system
    permanent_cameras = get_fallback_cameras()
    
    try:
        if cameras_collection:
            # Try to get additional cameras from database
            additional_cameras = []
            async for camera in cameras_collection.find({}):
                camera["_id"] = str(camera["_id"])
                # Only add if it's not one of the permanent cameras
                if not any(perm_cam["camera_id"] == camera["camera_id"] for perm_cam in permanent_cameras):
                    additional_cameras.append(camera)
            
            # Return permanent cameras + any additional cameras
            all_cameras = permanent_cameras + additional_cameras
            logger.info(f"✅ Returning {len(permanent_cameras)} permanent + {len(additional_cameras)} additional cameras")
            return all_cameras
        else:
            logger.info("📱 Database unavailable, returning 6 permanent cameras")
            return permanent_cameras
    except Exception as e:
        logger.error(f"Error getting cameras: {e}")
        logger.info("📱 Fallback: returning 6 permanent cameras")
        return permanent_cameras

async def get_camera(camera_id: str):
    """Get a specific camera - checks permanent cameras first"""
    # Check permanent cameras first
    permanent_cameras = get_fallback_cameras()
    permanent_camera = next((cam for cam in permanent_cameras if cam["camera_id"] == camera_id), None)
    
    if permanent_camera:
        return permanent_camera
    
    # If not a permanent camera, check database for additional cameras
    try:
        if cameras_collection:
            camera = await cameras_collection.find_one({"camera_id": camera_id})
            if camera:
                camera["_id"] = str(camera["_id"])
                return camera
        return None
    except Exception as e:
        logger.error(f"Error getting camera {camera_id}: {e}")
        return None

async def update_camera_status(camera_id: str, status: str):
    """Update camera status with real-time broadcasting"""
    try:
        if cameras_collection:
            result = await cameras_collection.update_one(
                {"camera_id": camera_id},
                {"$set": {"status": status, "updated_at": datetime.utcnow()}}
            )
            
            success = result.modified_count > 0
            if success:
                # Broadcast camera status update
                try:
                    updated_camera = await cameras_collection.find_one({"camera_id": camera_id})
                    if updated_camera:
                        updated_camera["_id"] = str(updated_camera["_id"])
                        from app import websocket_manager
                        await websocket_manager.broadcast_camera_update(updated_camera)
                except Exception as broadcast_error:
                    logger.error(f"Error broadcasting camera update: {broadcast_error}")
            
            return success
        else:
            logger.info(f"Fallback mode: Camera {camera_id} status would be updated to {status}")
            
            # Broadcast even in fallback mode
            try:
                from app import websocket_manager
                fallback_camera = {
                    "camera_id": camera_id,
                    "status": status,
                    "updated_at": datetime.utcnow().isoformat()
                }
                await websocket_manager.broadcast_camera_update(fallback_camera)
            except Exception as e:
                logger.error(f"Error broadcasting fallback camera update: {e}")
            
            return True
    except Exception as e:
        logger.error(f"Error updating camera status: {e}")
        return False

# Incident operations with fallback
async def create_incident(incident_data: Dict):
    """Create a new incident with real-time broadcasting"""
    try:
        if incidents_collection:
            incident_data["created_at"] = datetime.utcnow()
            incident_data["updated_at"] = datetime.utcnow()
            
            result = await incidents_collection.insert_one(incident_data)
            incident_data["_id"] = str(result.inserted_id)
            
            # Broadcast new incident to all clients
            try:
                from app import websocket_manager
                await websocket_manager.broadcast_incident_update(incident_data)
                
                # Also broadcast updated stats
                stats = await get_incident_stats()
                await websocket_manager.broadcast_stats_update(stats)
            except Exception as broadcast_error:
                logger.error(f"Error broadcasting new incident: {broadcast_error}")
            
            return incident_data
        else:
            incident_data["_id"] = f"fallback-{datetime.now().timestamp()}"
            incident_data["created_at"] = datetime.utcnow()
            logger.info(f"Fallback mode: Incident created {incident_data['_id']}")
            
            # Broadcast even in fallback mode
            try:
                from app import websocket_manager
                await websocket_manager.broadcast_incident_update(incident_data)
            except Exception as e:
                logger.error(f"Error broadcasting fallback incident: {e}")
            
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
    """Update incident status with real-time broadcasting"""
    try:
        if incidents_collection and MOTOR_AVAILABLE:
            # Try to import ObjectId safely
            try:
                from bson import ObjectId
                from bson.errors import InvalidId
                BSON_AVAILABLE = True
            except ImportError:
                BSON_AVAILABLE = False
            
            # First try to find by custom 'id' field
            result = await incidents_collection.update_one(
                {"id": incident_id},
                {"$set": {"status": status, "updated_at": datetime.utcnow()}}
            )
            
            # If no document was updated and BSON is available, try with MongoDB ObjectId
            if result.modified_count == 0 and BSON_AVAILABLE:
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
                
                # Broadcast real-time update
                try:
                    # Get updated incident data
                    if BSON_AVAILABLE and ObjectId.is_valid(incident_id):
                        updated_incident = await incidents_collection.find_one(
                            {"$or": [{"id": incident_id}, {"_id": ObjectId(incident_id)}]}
                        )
                    else:
                        updated_incident = await incidents_collection.find_one({"id": incident_id})
                        
                    if updated_incident:
                        updated_incident["_id"] = str(updated_incident["_id"])
                        if "id" not in updated_incident:
                            updated_incident["id"] = updated_incident["_id"]
                        
                        # Import websocket manager and broadcast
                        from app import websocket_manager
                        await websocket_manager.broadcast_incident_update(updated_incident)
                        
                        # Also broadcast updated stats
                        stats = await get_incident_stats()
                        await websocket_manager.broadcast_stats_update(stats)
                        
                except Exception as broadcast_error:
                    logger.error(f"Error broadcasting incident update: {broadcast_error}")
            else:
                logger.warning(f"❌ Incident {incident_id} not found")
                
            return success
        else:
            logger.info(f"Fallback mode: Incident {incident_id} status would be updated to {status}")
            
            # Even in fallback mode, broadcast the update for frontend consistency
            try:
                from app import websocket_manager
                fallback_incident = {
                    "id": incident_id,
                    "status": status,
                    "updated_at": datetime.utcnow().isoformat()
                }
                await websocket_manager.broadcast_incident_update(fallback_incident)
            except Exception as e:
                logger.error(f"Error broadcasting fallback update: {e}")
            
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
            # Calculate stats from fallback data
            fallback_incidents = get_fallback_incidents()
            total = len(fallback_incidents)
            active = len([inc for inc in fallback_incidents if inc["status"] == "active"])
            resolved = len([inc for inc in fallback_incidents if inc["status"] == "resolved"])
            false_alarms = len([inc for inc in fallback_incidents if inc["status"] == "false-alarm"])
            investigating = len([inc for inc in fallback_incidents if inc["status"] == "investigating"])
            
            return {
                "total": total,
                "active": active,
                "resolved": resolved,
                "false_alarms": false_alarms,
                "investigating": investigating
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
                try:
                    from passlib.context import CryptContext
                    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
                    return {
                        "_id": "fallback-admin",
                        "username": "admin",
                        "hashed_password": pwd_context.hash("admin@123"),
                        "email": "admin@smartcity.com",
                        "is_active": True
                    }
                except ImportError:
                    # Simple fallback without password hashing
                    return {
                        "_id": "fallback-admin",
                        "username": "admin",
                        "hashed_password": "admin@123",  # Plain text in fallback
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