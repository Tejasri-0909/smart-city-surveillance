// sampleData.js
const incidentTypes = [
  "Weapon Detected",
  "Suspicious Activity", 
  "Unauthorized Access",
  "Vandalism",
  "Fire Detected"
];

const locations = [
  "City Center",
  "Metro Station", 
  "Airport Gate",
  "Shopping Mall",
  "Park Entrance",
  "Highway Bridge"
];

const severities = ["low", "medium", "high", "critical"];

export function generateIncident(id) {
  const type = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const camera = "CAM00" + Math.floor(Math.random() * 6 + 1);

  return {
    id,
    camera_id: camera,
    incident_type: type,
    location: location,
    severity: severity,
    status: "active",
    timestamp: new Date().toISOString()
  };
}

export function generateIncidents(count = 15) {
  const incidents = [];
  for (let i = 0; i < count; i++) {
    incidents.push(generateIncident(i + 1));
  }
  return incidents;
}

export function generateAlert() {
  const incident = generateIncident(Date.now());
  return {
    id: incident.id,
    camera_id: incident.camera_id,
    incident_type: incident.incident_type,
    location: incident.location,
    message: `${incident.incident_type} detected at ${incident.camera_id} (${incident.location})`,
    timestamp: new Date().toLocaleTimeString()
  };
}