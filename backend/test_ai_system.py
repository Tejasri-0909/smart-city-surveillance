#!/usr/bin/env python3
"""
Test script for Smart City AI Surveillance System
Tests AI detection, database operations, and WebSocket functionality
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_detection import get_detector_status, detect_threats_in_frame
from database import init_database, get_cameras, create_incident, get_incident_stats
from websocket_manager import broadcast_alert
from camera_processor import initialize_camera_processor, get_camera_status
import numpy as np

async def test_database():
    """Test database connectivity and operations"""
    print("🔍 Testing Database Connection...")
    try:
        await init_database()
        cameras = await get_cameras()
        print(f"✅ Database connected. Found {len(cameras)} cameras.")
        
        # Test incident creation
        test_incident = {
            "camera_id": "CAM001",
            "incident_type": "Test Incident",
            "location": "Test Location",
            "severity": "low",
            "status": "active"
        }
        incident = await create_incident(test_incident)
        print(f"✅ Test incident created: {incident['id']}")
        
        # Test stats
        stats = await get_incident_stats()
        print(f"✅ Incident stats: {stats}")
        
        return True
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def test_ai_detection():
    """Test AI detection system"""
    print("\n🤖 Testing AI Detection System...")
    try:
        status = get_detector_status()
        print(f"✅ AI Detector Status: {status}")
        
        # Test with dummy frame
        dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        result = detect_threats_in_frame(dummy_frame, "CAM001")
        
        if result:
            print(f"✅ AI Detection working: {result}")
        else:
            print("✅ AI Detection working (no threats detected in test frame)")
            
        return True
    except Exception as e:
        print(f"❌ AI Detection test failed: {e}")
        return False

async def test_websocket():
    """Test WebSocket alert broadcasting"""
    print("\n📡 Testing WebSocket System...")
    try:
        test_alert = {
            "camera_id": "CAM001",
            "incident_type": "Test Alert",
            "location": "Test Location",
            "severity": "low",
            "message": "This is a test alert"
        }
        
        await broadcast_alert(test_alert)
        print("✅ WebSocket alert broadcast successful")
        return True
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False

def test_camera_processor():
    """Test camera processing system"""
    print("\n📹 Testing Camera Processor...")
    try:
        # Initialize camera processor
        processor = initialize_camera_processor()
        
        # Get camera status
        status = get_camera_status()
        print(f"✅ Camera Processor initialized. Status: {status}")
        
        return True
    except Exception as e:
        print(f"❌ Camera Processor test failed: {e}")
        return False

async def run_system_tests():
    """Run all system tests"""
    print("🚀 Starting Smart City AI Surveillance System Tests\n")
    
    tests = [
        ("Database", test_database()),
        ("AI Detection", test_ai_detection()),
        ("WebSocket", test_websocket()),
        ("Camera Processor", test_camera_processor())
    ]
    
    results = []
    for test_name, test_func in tests:
        if asyncio.iscoroutine(test_func):
            result = await test_func
        else:
            result = test_func
        results.append((test_name, result))
    
    print("\n📊 Test Results Summary:")
    print("=" * 40)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<20} {status}")
        if result:
            passed += 1
    
    print("=" * 40)
    print(f"Tests Passed: {passed}/{len(results)}")
    
    if passed == len(results):
        print("\n🎉 All tests passed! System is ready for deployment.")
    else:
        print(f"\n⚠️  {len(results) - passed} test(s) failed. Please check the configuration.")
    
    return passed == len(results)

if __name__ == "__main__":
    print("Smart City AI Surveillance System - Test Suite")
    print("=" * 50)
    
    try:
        result = asyncio.run(run_system_tests())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {e}")
        sys.exit(1)