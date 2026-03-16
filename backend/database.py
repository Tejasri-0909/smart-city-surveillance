from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(MONGO_URL)

db = client["smart_city_surveillance"]

users_collection = db["users"]
cameras_collection = db["cameras"]
incidents_collection = db["incidents"]