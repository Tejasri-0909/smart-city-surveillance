#!/usr/bin/env python3
"""
24/7 Camera Status Manager - Ensures all cameras are always active
"""
import asyncio
import logging
from datetime import datetime, timedelta
from database import cameras_collection, get_cameras, update_camera_status

logger = logging.getLogger(__name__)

class Camera24_7Manager:
    def __init__(self):
        self.running = False
        self.check_interval = 60  # Check every minute
        self.cameras_to_monitor = [
            "CAM001", "CAM002", "CAM003", "CAM004", "CAM005", "CAM006"
        ]
    
    async def ensure_camera_active(self, camera_id):
        """Ensure a specific camera is active"""
        try:
            # Update camera status to active
            success = await update_camera_status(camera_id, "active")
            if success:
                logger.info(f"✅ Camera {camera_id} set to active")
            else:
                logger.warning(f"⚠️ Failed to update {camera_id} status")
            return success
        except Exception as e:
            logger.error(f"❌ Error updating camera {camera_id}: {e}")
            return False
    
    async def ensure_all_cameras_active(self):
        """Ensure all cameras are active"""
        try:
            cameras = await get_cameras()
            
            for camera in cameras:
                camera_id = camera.get("camera_id")
                current_status = camera.get("status", "offline")
                
                if current_status != "active":
                    logger.info(f"🔧 Camera {camera_id} is {current_status}, setting to active...")
                    await self.ensure_camera_active(camera_id)
                else:
                    logger.debug(f"✅ Camera {camera_id} is already active")
            
            # Also ensure any missing cameras are added as active
            existing_camera_ids = [cam.get("camera_id") for cam in cameras]
            for camera_id in self.cameras_to_monitor:
                if camera_id not in existing_camera_ids:
                    logger.info(f"➕ Adding missing camera {camera_id}")
                    await self.add_missing_camera(camera_id)
                    
        except Exception as e:
            logger.error(f"❌ Error in ensure_all_cameras_active: {e}")
    
    async def add_missing_camera(self, camera_id):
        """Add a missing camera to the database"""
        try:
            # Camera location mapping
            locations = {
                "CAM001": {"location": "City Center", "lat": 40.7128, "lng": -74.0060},
                "CAM002": {"location": "Metro Station", "lat": 40.7589, "lng": -73.9851},
                "CAM003": {"location": "Airport Gate", "lat": 40.6892, "lng": -74.1745},
                "CAM004": {"location": "Shopping Mall", "lat": 40.7505, "lng": -73.9934},
                "CAM005": {"location": "Park Entrance", "lat": 40.7829, "lng": -73.9654},
                "CAM006": {"location": "Highway Bridge", "lat": 40.7282, "lng": -74.0776}
            }
            
            camera_info = locations.get(camera_id, {
                "location": f"Location {camera_id[-1]}", 
                "lat": 40.7128, 
                "lng": -74.0060
            })
            
            camera_data = {
                "camera_id": camera_id,
                "location": camera_info["location"],
                "latitude": camera_info["lat"],
                "longitude": camera_info["lng"],
                "status": "active",
                "stream_url": f"/cctv/cam{camera_id[-1]}.mp4",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            await cameras_collection.insert_one(camera_data)
            logger.info(f"✅ Added camera {camera_id} as active")
            
        except Exception as e:
            logger.error(f"❌ Error adding camera {camera_id}: {e}")
    
    async def monitor_cameras_24_7(self):
        """Monitor cameras 24/7 and keep them active"""
        logger.info("🎥 Starting 24/7 camera monitoring...")
        self.running = True
        
        while self.running:
            try:
                logger.info("🔍 Checking camera status...")
                await self.ensure_all_cameras_active()
                
                # Wait for next check
                await asyncio.sleep(self.check_interval)
                
            except Exception as e:
                logger.error(f"❌ Error in camera monitoring loop: {e}")
                await asyncio.sleep(10)  # Short wait before retry
    
    def stop_monitoring(self):
        """Stop the monitoring loop"""
        logger.info("🛑 Stopping camera monitoring...")
        self.running = False

# Global camera manager instance
camera_manager = Camera24_7Manager()

async def start_camera_24_7_monitoring():
    """Start the 24/7 camera monitoring"""
    await camera_manager.monitor_cameras_24_7()

def stop_camera_24_7_monitoring():
    """Stop the 24/7 camera monitoring"""
    camera_manager.stop_monitoring()

# Function to be called from main.py
async def initialize_24_7_cameras():
    """Initialize all cameras as active on startup"""
    logger.info("🚀 Initializing 24/7 camera system...")
    await camera_manager.ensure_all_cameras_active()
    
    # Start background monitoring task
    asyncio.create_task(camera_manager.monitor_cameras_24_7())
    logger.info("✅ 24/7 camera monitoring started")