import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import HeatmapLayer from '../components/HeatmapLayer';
import L from 'leaflet';
import { Camera, AlertTriangle, Eye, MapPin, Activity } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom camera marker icons
const createCameraIcon = (status, hasAlert = false) => {
  let color = '#00ff88'; // Green for normal
  if (hasAlert) color = '#ff4444'; // Red for alert
  else if (status === 'offline') color = '#666666'; // Gray for offline
  else if (status === 'maintenance') color = '#ffaa00'; // Yellow for maintenance

  return L.divIcon({
    className: 'custom-camera-marker',
    html: `
      <div class="camera-marker ${hasAlert ? 'alert-flash' : ''}" style="background-color: ${color}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Custom incident marker icon
const createIncidentIcon = (severity) => {
  let color = '#ff4444';
  if (severity === 'critical') color = '#ff0000';
  else if (severity === 'high') color = '#ff4444';
  else if (severity === 'medium') color = '#ffaa00';
  else if (severity === 'low') color = '#00ff88';

  return L.divIcon({
    className: 'custom-incident-marker',
    html: `
      <div class="incident-marker" style="background-color: ${color}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

const CityMap = () => {
  const [cameras, setCameras] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [alertingCameras, setAlertingCameras] = useState(new Set());
  const [mapCenter] = useState([40.7128, -74.0060]); // NYC coordinates
  const { alerts } = useAlert();
  const mapRef = useRef();

  useEffect(() => {
    fetchCameras();
    fetchIncidents();
  }, []);

  useEffect(() => {
    // Update alerting cameras based on alerts
    const newAlertingCameras = new Set();
    alerts.forEach(alert => {
      if (alert.camera_id) {
        newAlertingCameras.add(alert.camera_id);
      }
    });
    setAlertingCameras(newAlertingCameras);
  }, [alerts]);

  useEffect(() => {
    // Generate heatmap data from incidents
    const heatData = incidents.map(incident => [
      incident.latitude || (40.7128 + (Math.random() - 0.5) * 0.1),
      incident.longitude || (-74.0060 + (Math.random() - 0.5) * 0.1),
      0.8 // intensity
    ]);
    setHeatmapData(heatData);
  }, [incidents]);

  const fetchCameras = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/cameras');
      setCameras(response.data.cameras);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      // Use sample data with coordinates
      const sampleCameras = [
        { camera_id: 'CAM001', location: 'City Center', status: 'active', latitude: 40.7128, longitude: -74.0060 },
        { camera_id: 'CAM002', location: 'Metro Station', status: 'active', latitude: 40.7589, longitude: -73.9851 },
        { camera_id: 'CAM003', location: 'Airport Gate', status: 'active', latitude: 40.6892, longitude: -74.1745 },
        { camera_id: 'CAM004', location: 'Shopping Mall', status: 'active', latitude: 40.7505, longitude: -73.9934 },
        { camera_id: 'CAM005', location: 'Park Entrance', status: 'offline', latitude: 40.7829, longitude: -73.9654 },
        { camera_id: 'CAM006', location: 'Highway Bridge', status: 'active', latitude: 40.7282, longitude: -74.0776 }
      ];
      setCameras(sampleCameras);
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/incidents');
      setIncidents(response.data.incidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      // Use sample incidents with coordinates
      const sampleIncidents = [
        {
          id: 1,
          camera_id: 'CAM002',
          incident_type: 'Weapon Detected',
          location: 'Metro Station',
          latitude: 40.7589,
          longitude: -73.9851,
          severity: 'high',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          camera_id: 'CAM001',
          incident_type: 'Suspicious Activity',
          location: 'City Center',
          latitude: 40.7128,
          longitude: -74.0060,
          severity: 'medium',
          timestamp: new Date().toISOString()
        }
      ];
      setIncidents(sampleIncidents);
    }
  };

  const handleCameraClick = (camera) => {
    setSelectedCamera(camera);
  };

  const zoomToIncident = (incident) => {
    if (mapRef.current) {
      mapRef.current.setView([incident.latitude, incident.longitude], 16);
    }
  };

  const openLiveMonitoring = (camera) => {
    // Navigate to live monitoring with selected camera
    window.location.href = `/live-monitoring?camera=${camera.camera_id}`;
  };

  return (
    <div className="city-map-page">
      <div className="map-header">
        <div>
          <h2>City Surveillance Map</h2>
          <p>Real-time monitoring of camera locations and incident hotspots</p>
        </div>
        
        <div className="map-controls">
          <button 
            className={`btn ${showHeatmap ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            <Activity size={16} />
            {showHeatmap ? 'Hide' : 'Show'} Heatmap
          </button>
        </div>
      </div>

      <div className="map-container">
        <div className="map-wrapper">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {/* Heatmap Layer */}
            {showHeatmap && heatmapData.length > 0 && (
              <HeatmapLayer
                points={heatmapData}
                options={{
                  radius: 100,
                  gradient: ['#ff4444', '#ff6666', '#ff8888']
                }}
              />
            )}

            {/* Camera Markers */}
            {cameras.map((camera) => (
              <Marker
                key={camera.camera_id}
                position={[camera.latitude, camera.longitude]}
                icon={createCameraIcon(camera.status, alertingCameras.has(camera.camera_id))}
                eventHandlers={{
                  click: () => handleCameraClick(camera)
                }}
              >
                <Popup>
                  <div className="camera-popup">
                    <div className="popup-header">
                      <Camera size={16} />
                      <span>{camera.camera_id}</span>
                    </div>
                    <div className="popup-content">
                      <p><MapPin size={12} /> {camera.location}</p>
                      <p>Status: <span className={`status ${camera.status}`}>{camera.status?.toUpperCase()}</span></p>
                      
                      <div className="popup-preview">
                        <div className="mini-feed">
                          <span>🎥 LIVE</span>
                        </div>
                      </div>
                      
                      <div className="popup-actions">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openLiveMonitoring(camera)}
                        >
                          <Eye size={12} />
                          View Live Feed
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Incident Markers */}
            {incidents.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.latitude, incident.longitude]}
                icon={createIncidentIcon(incident.severity)}
              >
                <Popup>
                  <div className="incident-popup">
                    <div className="popup-header">
                      <AlertTriangle size={16} />
                      <span>{incident.incident_type}</span>
                    </div>
                    <div className="popup-content">
                      <p><MapPin size={12} /> {incident.location}</p>
                      <p>Camera: {incident.camera_id}</p>
                      <p>Severity: <span className={`severity ${incident.severity}`}>{incident.severity?.toUpperCase()}</span></p>
                      <p>Time: {new Date(incident.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Incident History Panel */}
        <div className="incident-history-panel">
          <div className="panel-header">
            <h3>Recent Incidents</h3>
            <span className="incident-count">{incidents.length}</span>
          </div>
          
          <div className="incident-list">
            {incidents.slice(0, 10).map((incident) => (
              <div 
                key={incident.id}
                className="incident-item"
                onClick={() => zoomToIncident(incident)}
              >
                <div className="incident-icon">
                  <AlertTriangle size={14} />
                </div>
                <div className="incident-details">
                  <div className="incident-type">{incident.incident_type}</div>
                  <div className="incident-location">{incident.camera_id} - {incident.location}</div>
                  <div className="incident-time">{new Date(incident.timestamp).toLocaleTimeString()}</div>
                </div>
                <div className={`severity-badge ${incident.severity}`}>
                  {incident.severity}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-marker camera-normal"></div>
            <span>Camera Normal</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker camera-alert"></div>
            <span>Camera Alert</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker camera-offline"></div>
            <span>Camera Offline</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker incident-marker"></div>
            <span>Incident</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityMap;