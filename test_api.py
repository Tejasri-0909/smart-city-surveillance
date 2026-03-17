#!/usr/bin/env python3
import requests
import json

try:
    print("Testing incidents endpoint...")
    response = requests.get("http://localhost:8001/incidents")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        incidents = data.get('incidents', [])
        print(f"Total incidents: {len(incidents)}")
        print(f"Response structure: {list(data.keys())}")
        
        # Show first few incidents
        for i, incident in enumerate(incidents[:3]):
            print(f"\nIncident {i+1}:")
            print(f"  ID: {incident.get('id', 'N/A')}")
            print(f"  Camera: {incident.get('camera_id', 'N/A')}")
            print(f"  Type: {incident.get('incident_type', 'N/A')}")
            print(f"  Status: {incident.get('status', 'N/A')}")
            print(f"  Location: {incident.get('location', 'N/A')}")
    else:
        print(f"Error: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")