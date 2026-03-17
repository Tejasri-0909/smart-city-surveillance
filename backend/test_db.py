#!/usr/bin/env python3
import asyncio
from database import get_incidents, incidents_collection

async def test_database():
    try:
        print("Testing database connection...")
        
        # Test direct collection access
        count = await incidents_collection.count_documents({})
        print(f"Total incidents in database: {count}")
        
        # Test get_incidents function
        incidents = await get_incidents(limit=5)
        print(f"Retrieved {len(incidents)} incidents via get_incidents()")
        
        if incidents:
            print("\nFirst incident:")
            incident = incidents[0]
            for key, value in incident.items():
                print(f"  {key}: {value}")
        
    except Exception as e:
        print(f"Database error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_database())