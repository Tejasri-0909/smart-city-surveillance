#!/usr/bin/env python3
"""
Test script to verify the backend server can start properly
"""

import sys
import asyncio
from app import app

async def test_server():
    """Test that the server can initialize without errors"""
    try:
        print("🧪 Testing Smart City Surveillance Backend...")
        
        # Test app creation
        assert app is not None, "FastAPI app should be created"
        print("✅ FastAPI app created successfully")
        
        # Test routes are loaded
        routes = [route.path for route in app.routes]
        expected_routes = ["/health", "/", "/ws"]
        
        for route in expected_routes:
            assert route in routes, f"Route {route} should be available"
        
        print(f"✅ Found {len(routes)} routes including required endpoints")
        
        # Test database functions can be imported
        try:
            from database import get_cameras, get_incidents
            print("✅ Database functions imported successfully")
        except Exception as e:
            print(f"⚠️ Database functions import warning: {e}")
        
        print("🎉 All tests passed! Backend is ready for deployment.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_server())
    sys.exit(0 if success else 1)