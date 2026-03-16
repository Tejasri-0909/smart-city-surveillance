import random
import time
import requests

API_URL = "http://127.0.0.1:8000/incidents/report"

cameras = ["CAM001", "CAM002", "CAM003"]

incident_types = [
    "Suspicious Activity",
    "Crowd Formation",
    "Fire Detected",
    "Weapon Detected"
]

locations = [
    "City Center",
    "Metro Station",
    "Shopping Mall",
    "Main Road"
]

while True:
    camera = random.choice(cameras)
    incident = random.choice(incident_types)
    location = random.choice(locations)

    data = {
        "camera_id": camera,
        "incident_type": incident,
        "location": location
    }

    try:
        response = requests.post(API_URL, params=data)
        print("AI detected:", incident, "at", location)
    except:
        print("Server not reachable")

    time.sleep(10)