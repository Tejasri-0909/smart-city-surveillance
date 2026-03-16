#!/usr/bin/env python3
"""
Test script for map endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_map_endpoints():
    print("🗺️  Testing Smart City Map Endpoints")
    print("=" * 50)
    
    # Test 1: Get cameras with status
    print("\n1. Testing cameras with status...")
    try:
        response = requests.get(f"{BASE_URL}/map/cameras-with-status")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {len(data['cameras'])} cameras")
            if data['cameras']:
                print(f"   Sample camera: {data['cameras'][0]['camera_id']} at {data['cameras'][0]['location']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Get map statistics
    print("\n2. Testing map statistics...")
    try:
        response = requests.get(f"{BASE_URL}/map/map-statistics")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Statistics retrieved:")
            print(f"   Total cameras: {data['cameras']['total']}")
            print(f"   Active cameras: {data['cameras']['active']}")
            print(f"   Active incidents: {data['incidents']['active']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Get heatmap data
    print("\n3. Testing heatmap data...")
    try:
        response = requests.get(f"{BASE_URL}/map/heatmap-data")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Heatmap data retrieved:")
            print(f"   Heatmap points: {len(data['heatmap_points'])}")
            print(f"   Total incidents: {data['total_incidents']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Simulate incident on map
    print("\n4. Testing incident simulation...")
    try:
        response = requests.post(f"{BASE_URL}/map/simulate-incident-on-map?camera_id=CAM001")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Incident simulated:")
            print(f"   Type: {data['incident']['incident_type']}")
            print(f"   Location: {data['incident']['location']}")
            print(f"   Severity: {data['incident']['severity']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 5: Test WebSocket broadcast
    print("\n5. Testing alert broadcast...")
    try:
        payload = {
            "alert_type": "Weapon Detected",
            "camera_id": "CAM002",
            "location": "Metro Station",
            "severity": "high",
            "message": "Test alert for map integration"
        }
        response = requests.post(f"{BASE_URL}/realtime/broadcast-alert", params=payload)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Alert broadcasted successfully")
            print(f"   Message: {data['alert']['message']}")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Map endpoint testing complete!")
    print("\n📍 Next steps:")
    print("   1. Open http://localhost:5175 in your browser")
    print("   2. Navigate to 'City Surveillance Map'")
    print("   3. Test real-time alerts and camera interactions")
    print("   4. Verify heatmap visualization")

if __name__ == "__main__":
    test_map_endpoints()