#!/usr/bin/env python3
"""
Force clean all collections and reseed with exact data
"""
import asyncio
from database import cameras_collection, incidents_collection, alerts_collection
from datetime import datetime, timedelta

async def force_clean_all():
    """Force clean all collections"""
    
    print("🧹 Force cleaning ALL collections...")
    
    # Drop all collections completely
    try:
        await cameras_collection.drop()
        print("✅ Cameras collection dropped")
    except:
        print("⚠️ Cameras collection didn't exist")
    
    try:
        await incidents_collection.drop()
        print("✅ Incidents collection dropped")
    except:
        print("⚠️ Incidents collection didn't exist")
        
    try:
        await alerts_collection.drop()
        print("✅ Alerts collection dropped")
    except:
        print("⚠️ Alerts collection didn't exist")
    
    print("✅ All collections cleaned")
    
    # Add exactly 6 cameras
    sample_cameras = [
        {
            "id": "cam-001",
            "camera_id": "CAM001",
            "location": "City Center",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "status": "active",
            "stream_url": "/cctv/cam1.mp4",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "cam-002",
            "camera_id": "CAM002",
            "location": "Metro Station",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "status": "active",
            "stream_url": "/cctv/cam2.mp4",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "cam-003",
            "camera_id": "CAM003",
            "location": "Airport Gate",
            "latitude": 40.6892,
            "longitude": -74.1745,
            "status": "active",
            "stream_url": "/cctv/cam3.mp4",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "cam-004",
            "camera_id": "CAM004",
            "location": "Shopping Mall",
            "latitude": 40.7505,
            "longitude": -73.9934,
            "status": "active",
            "stream_url": "/cctv/cam4.mp4",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "cam-005",
            "camera_id": "CAM005",
            "location": "Park Entrance",
            "latitude": 40.7829,
            "longitude": -73.9654,
            "status": "active",
            "stream_url": "/cctv/cam5.mp4",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": "cam-006",
            "camera_id": "CAM006",
            "location": "Highway Bridge",
            "latitude": 40.7282,
            "longitude": -74.0776,
            "status": "active",
            "stream_url": "/cctv/cam6.mp4",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    await cameras_collection.insert_many(sample_cameras)
    print(f"✅ Inserted exactly {len(sample_cameras)} cameras")
    
    # Add exactly 8 incidents
    sample_incidents = [
        {
            "id": "incident-001",
            "camera_id": "CAM002",
            "incident_type": "Suspicious Activity",
            "location": "Metro Station",
            "severity": "medium",
            "status": "active",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "latitude": 40.7589,
            "longitude": -73.9851,
            "description": "Suspicious behavior detected at Metro Station",
            "created_at": datetime.now() - timedelta(hours=2),
            "updated_at": datetime.now() - timedelta(hours=2)
        },
        {
            "id": "incident-002",
            "camera_id": "CAM004",
            "incident_type": "Weapon Detected",
            "location": "Shopping Mall",
            "severity": "critical",
            "status": "active",
            "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
            "latitude": 40.7505,
            "longitude": -73.9934,
            "description": "Weapon detection alert at Shopping Mall",
            "created_at": datetime.now() - timedelta(hours=1),
            "updated_at": datetime.now() - timedelta(hours=1)
        },
        {
            "id": "incident-003",
            "camera_id": "CAM001",
            "incident_type": "Fire Detected",
            "location": "City Center",
            "severity": "high",
            "status": "resolved",
            "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
            "latitude": 40.7128,
            "longitude": -74.0060,
            "description": "Fire alarm triggered at City Center",
            "created_at": datetime.now() - timedelta(hours=4),
            "updated_at": datetime.now() - timedelta(hours=1)
        },
        {
            "id": "incident-004",
            "camera_id": "CAM003",
            "incident_type": "Unauthorized Access",
            "location": "Airport Gate",
            "severity": "high",
            "status": "active",
            "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(),
            "latitude": 40.6892,
            "longitude": -74.1745,
            "description": "Unauthorized access attempt at Airport Gate",
            "created_at": datetime.now() - timedelta(minutes=30),
            "updated_at": datetime.now() - timedelta(minutes=30)
        },
        {
            "id": "incident-005",
            "camera_id": "CAM005",
            "incident_type": "Suspicious Activity",
            "location": "Park Entrance",
            "severity": "low",
            "status": "false-alarm",
            "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
            "latitude": 40.7829,
            "longitude": -73.9654,
            "description": "False alarm at Park Entrance",
            "created_at": datetime.now() - timedelta(hours=6),
            "updated_at": datetime.now() - timedelta(hours=2)
        },
        {
            "id": "incident-006",
            "camera_id": "CAM006",
            "incident_type": "Weapon Detected",
            "location": "Highway Bridge",
            "severity": "critical",
            "status": "active",
            "timestamp": (datetime.now() - timedelta(minutes=15)).isoformat(),
            "latitude": 40.7282,
            "longitude": -74.0776,
            "description": "Critical weapon detection at Highway Bridge",
            "created_at": datetime.now() - timedelta(minutes=15),
            "updated_at": datetime.now() - timedelta(minutes=15)
        },
        {
            "id": "incident-007",
            "camera_id": "CAM002",
            "incident_type": "Fire Detected",
            "location": "Metro Station",
            "severity": "medium",
            "status": "resolved",
            "timestamp": (datetime.now() - timedelta(hours=8)).isoformat(),
            "latitude": 40.7589,
            "longitude": -73.9851,
            "description": "Fire detection resolved at Metro Station",
            "created_at": datetime.now() - timedelta(hours=8),
            "updated_at": datetime.now() - timedelta(hours=3)
        },
        {
            "id": "incident-008",
            "camera_id": "CAM004",
            "incident_type": "Unauthorized Access",
            "location": "Shopping Mall",
            "severity": "medium",
            "status": "active",
            "timestamp": (datetime.now() - timedelta(hours=3)).isoformat(),
            "latitude": 40.7505,
            "longitude": -73.9934,
            "description": "Unauthorized access detected at Shopping Mall",
            "created_at": datetime.now() - timedelta(hours=3),
            "updated_at": datetime.now() - timedelta(hours=3)
        }
    ]
    
    await incidents_collection.insert_many(sample_incidents)
    print(f"✅ Inserted exactly {len(sample_incidents)} incidents")
    
    # Verify counts
    camera_count = await cameras_collection.count_documents({})
    incident_count = await incidents_collection.count_documents({})
    
    print("\n" + "=" * 50)
    print("🎯 Force cleanup complete!")
    print("\n📊 Final Counts:")
    print(f"   Cameras: {camera_count}")
    print(f"   Incidents: {incident_count}")
    
    # Show incident breakdown
    active = await incidents_collection.count_documents({"status": "active"})
    resolved = await incidents_collection.count_documents({"status": "resolved"})
    false_alarms = await incidents_collection.count_documents({"status": "false-alarm"})
    
    print(f"\n📈 Incident Breakdown:")
    print(f"   Active: {active}")
    print(f"   Resolved: {resolved}")
    print(f"   False Alarms: {false_alarms}")
    print("\n🚀 Ready to test!")

if __name__ == "__main__":
    asyncio.run(force_clean_all())