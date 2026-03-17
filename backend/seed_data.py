#!/usr/bin/env python3
"""
Seed the database with sample cameras and incidents for testing
"""
import asyncio
from database import cameras_collection, incidents_collection
from datetime import datetime, timedelta
import random

async def seed_cameras():
    """Add sample cameras to the database"""
    
    # Clear existing cameras
    await cameras_collection.delete_many({})
    
    sample_cameras = [
        {
            "id": "cam-001",
            "camera_id": "CAM001",
            "location": "City Center",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "status": "active",
            "stream_url": "rtsp://example.com/stream1",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "cam-002",
            "camera_id": "CAM002",
            "location": "Metro Station",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "status": "active",
            "stream_url": "rtsp://example.com/stream2",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "cam-003",
            "camera_id": "CAM003",
            "location": "Airport Gate",
            "latitude": 40.6892,
            "longitude": -74.1745,
            "status": "active",
            "stream_url": "rtsp://example.com/stream3",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "cam-004",
            "camera_id": "CAM004",
            "location": "Shopping Mall",
            "latitude": 40.7505,
            "longitude": -73.9934,
            "status": "active",
            "stream_url": "rtsp://example.com/stream4",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "cam-005",
            "camera_id": "CAM005",
            "location": "Park Entrance",
            "latitude": 40.7829,
            "longitude": -73.9654,
            "status": "offline",
            "stream_url": "rtsp://example.com/stream5",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "cam-006",
            "camera_id": "CAM006",
            "location": "Highway Bridge",
            "latitude": 40.7282,
            "longitude": -74.0776,
            "status": "active",
            "stream_url": "rtsp://example.com/stream6",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]
    
    await cameras_collection.insert_many(sample_cameras)
    print(f"✅ Inserted {len(sample_cameras)} cameras")

async def seed_incidents():
    """Add sample incidents to the database"""
    
    # Clear existing incidents
    await incidents_collection.delete_many({})
    
    incident_types = ["Weapon Detected", "Suspicious Activity", "Fire Detected", "Unauthorized Access", "Vandalism"]
    severities = ["critical", "high", "medium", "low"]
    statuses = ["active", "resolved", "false-alarm", "investigating"]
    
    # Get cameras from database
    cameras = []
    async for camera in cameras_collection.find({}, {"_id": 0}):
        cameras.append(camera)
    
    sample_incidents = []
    
    # Generate incidents for the last 7 days
    for i in range(25):
        camera = random.choice(cameras)
        incident_time = datetime.now() - timedelta(
            hours=random.randint(1, 168),  # Last 7 days
            minutes=random.randint(0, 59)
        )
        
        # Add some random offset to coordinates for variety
        lat_offset = (random.random() - 0.5) * 0.01  # ~1km radius
        lng_offset = (random.random() - 0.5) * 0.01
        
        incident = {
            "id": f"incident-{i+1:03d}",
            "camera_id": camera["camera_id"],
            "incident_type": random.choice(incident_types),
            "location": camera["location"],
            "severity": random.choice(severities),
            "status": random.choice(statuses),
            "timestamp": incident_time.isoformat(),
            "latitude": camera["latitude"] + lat_offset,
            "longitude": camera["longitude"] + lng_offset,
            "description": f"Automated detection at {camera['location']}",
            "created_at": incident_time.isoformat(),
            "updated_at": incident_time.isoformat()
        }
        
        sample_incidents.append(incident)
    
    await incidents_collection.insert_many(sample_incidents)
    print(f"✅ Inserted {len(sample_incidents)} incidents")

async def main():
    print("🌱 Seeding Smart City Surveillance Database")
    print("=" * 50)
    
    await seed_cameras()
    await seed_incidents()
    
    print("\n" + "=" * 50)
    print("🎯 Database seeding complete!")
    print("\n📊 Summary:")
    print(f"   Cameras: {await cameras_collection.count_documents({})}")
    print(f"   Incidents: {await incidents_collection.count_documents({})}")
    print("\n🚀 Ready to test the Smart City Map!")

if __name__ == "__main__":
    asyncio.run(main())