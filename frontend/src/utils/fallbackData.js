// Complete fallback data when backend is unavailable

export const getFallbackCameras = () => [
  {
    id: "CAM001",
    camera_id: "CAM001",
    location: "City Center",
    latitude: 40.7128,
    longitude: -74.0060,
    status: "active",
    stream_url: "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771961/cam1_funvna.mp4"
  },
  {
    id: "CAM002", 
    camera_id: "CAM002",
    location: "Metro Station",
    latitude: 40.7589,
    longitude: -73.9851,
    status: "active",
    stream_url: "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771935/cam2_euevgq.mp4"
  },
  {
    id: "CAM003",
    camera_id: "CAM003", 
    location: "Airport Gate",
    latitude: 40.6892,
    longitude: -74.1745,
    status: "active",
    stream_url: "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771955/cam3_sug2zm.mp4"
  },
  {
    id: "CAM004",
    camera_id: "CAM004",
    location: "Shopping Mall", 
    latitude: 40.7505,
    longitude: -73.9934,
    status: "active",
    stream_url: "https://res.cloudinary.com/dybci4h1u/video/upload/v1773771984/cam4_xexpfj.mp4"
  },
  {
    id: "CAM005",
    camera_id: "CAM005",
    location: "Park Entrance",
    latitude: 40.7829,
    longitude: -73.9654, 
    status: "active",
    stream_url: "https://res.cloudinary.com/dybci4h1u/video/upload/v1773773966/Cam5_gefgvz.mp4"
  },
  {
    id: "CAM006",
    camera_id: "CAM006",
    location: "Highway Bridge",
    latitude: 40.7282,
    longitude: -74.0776,
    status: "active", 
    stream_url: "https://res.cloudinary.com/dybci4h1u/video/upload/v1773774617/Cam6_bwq6kd.mp4"
  }
];

export const getFallbackIncidents = () => [
  {
    id: 'fallback-1',
    _id: 'fallback-1',
    camera_id: "CAM002",
    location: "Metro Station", 
    latitude: 40.7589,
    longitude: -73.9851,
    incident_type: "Suspicious Activity",
    severity: "medium",
    status: "active",
    timestamp: new Date().toISOString(),
    description: "Suspicious behavior detected at metro entrance"
  },
  {
    id: 'fallback-2',
    _id: 'fallback-2', 
    camera_id: "CAM004",
    location: "Shopping Mall",
    latitude: 40.7505,
    longitude: -73.9934,
    incident_type: "Weapon Detected", 
    severity: "critical",
    status: "active",
    timestamp: new Date().toISOString(),
    description: "Weapon detection alert in main corridor"
  },
  {
    id: 'fallback-3',
    _id: 'fallback-3',
    camera_id: "CAM001", 
    location: "City Center",
    latitude: 40.7128,
    longitude: -74.006,
    incident_type: "Fire Detected",
    severity: "high", 
    status: "resolved",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    description: "Fire alarm triggered - resolved by emergency services"
  }
];

export const getFallbackHealthData = () => ({
  status: "healthy",
  database: "fallback-mode",
  cameras: 6,
  incidents: 3,
  websocket_connections: 0,
  timestamp: new Date().toISOString(),
  mode: "offline-fallback"
});