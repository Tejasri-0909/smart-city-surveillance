#!/usr/bin/env python3
import asyncio
from database import incidents_collection, cameras_collection
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def debug_database():
    """Debug database contents"""
    
    print("🔍 Debugging database contents...")
    
    # Check incident count
    incident_count = await incidents_collection.count_documents({})
    print(f"📊 Total incidents in collection: {incident_count}")
    
    # Check camera count
    camera_count = await cameras_collection.count_documents({})
    print(f"📊 Total cameras in collection: {camera_count}")
    
    # Show all incident IDs
    print("\n📋 All incident IDs:")
    async for incident in incidents_collection.find({}, {"id": 1, "_id": 1, "status": 1}):
        print(f"  - ID: {incident.get('id', 'N/A')}, MongoDB ID: {incident.get('_id', 'N/A')}, Status: {incident.get('status', 'N/A')}")
    
    # Check database name and collections
    MONGODB_URL = os.getenv("MONGO_URL", "mongodb+srv://username:password@cluster.mongodb.net/")
    DATABASE_NAME = "smart_city_surveillance"
    
    client = AsyncIOMotorClient(MONGODB_URL)
    database = client[DATABASE_NAME]
    
    collections = await database.list_collection_names()
    print(f"\n📁 Collections in database '{DATABASE_NAME}': {collections}")
    
    for collection_name in collections:
        collection = database[collection_name]
        count = await collection.count_documents({})
        print(f"  - {collection_name}: {count} documents")

if __name__ == "__main__":
    asyncio.run(debug_database())