import { useState, useEffect } from "react";
import { MapPin, AlertTriangle, Eye } from "lucide-react";
import { useAlert } from "../context/AlertContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CityMap = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { alerts, incidents, refreshIncidents } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      setLoading(true);
      await fetchCameras();
      // Refresh incidents from context to ensure sync
      refreshIncidents();
    } catch (err) {
      setError('Failed to load map data');
      console.error('Map initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCameras = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/cameras");
      setCameras(res.data.cameras || []);
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
      setCameras([
        {
          camera_id: "CAM001",
          location: "City Center",
          latitude: 40.7128,
          longitude: -74.006,
          status: "active",
        },
        {
          camera_id: "CAM002",
          location: "Metro Station",
          latitude: 40.7589,
          longitude: -73.9851,
          status: "active",
        },
        {
          camera_id: "CAM003",
          location: "Airport Gate",
          latitude: 40.6892,
          longitude: -74.1745,
          status: "active",
        },
        {
          camera_id: "CAM004",
          location: "Shopping Mall",
          latitude: 40.7505,
          longitude: -73.9934,
          status: "active",
        },
        {
          camera_id: "CAM005",
          location: "Park Entrance",
          latitude: 40.7829,
          longitude: -73.9654,
          status: "active",
        },
        {
          camera_id: "CAM006",
          location: "Highway Bridge",
          latitude: 40.7282,
          longitude: -74.0776,
          status: "active",
        },
      ]);
    }
  };

  const openLiveMonitoring = (camera) => {
    // Use React Router navigation instead of window.location
    navigate(`/live-monitoring?camera=${camera.camera_id}`);
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#00ff88'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid rgba(0, 255, 136, 0.3)',
            borderTop: '3px solid #00ff88',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h3>Loading City Map...</h3>
          <p>Initializing surveillance network</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#ff4444'
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle size={48} />
          <h3>Map Loading Error</h3>
          <p>{error}</p>
          <button 
            style={{
              background: '#00ff88',
              color: '#000',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
            onClick={initializeMap}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        background: '#1a1a2e',
        borderBottom: '1px solid #2a2a3e',
        color: '#00ff88'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={24} />
          <h2 style={{ margin: 0 }}>Smart City Surveillance Map</h2>
        </div>
        <div style={{ display: 'flex', gap: '30px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{cameras.length}</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Cameras</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{incidents.filter(inc => inc.status === 'active').length}</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Active Incidents</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{alerts.length}</div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>Alerts</div>
          </div>
        </div>
      </div>

      {/* Google Maps Embed with Incident Markers */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.119763973046!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sus!4v1647834567890!5m2!1sen!2sus"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>

        {/* Incident Location Markers Overlay - FIXED POSITIONING */}
        {incidents.filter(incident => incident.status === 'active').slice(0, 2).map((incident) => {
          // More accurate positioning for NYC area
          const mapBounds = {
            north: 40.8776,  // Adjusted for better NYC coverage
            south: 40.6774,
            east: -73.8004,  // Adjusted for better NYC coverage  
            west: -74.1591
          };
          
          // Clamp coordinates to ensure they're within NYC bounds
          const clampedLat = Math.max(mapBounds.south, Math.min(mapBounds.north, incident.latitude));
          const clampedLng = Math.max(mapBounds.west, Math.min(mapBounds.east, incident.longitude));
          
          const x = ((clampedLng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
          const y = ((mapBounds.north - clampedLat) / (mapBounds.north - mapBounds.south)) * 100;
          
          // Ensure markers stay within visible map area
          const safeX = Math.max(5, Math.min(95, x));
          const safeY = Math.max(5, Math.min(95, y));
          
          const severityColors = {
            critical: '#ff0000',
            high: '#ff4444', 
            medium: '#ffaa00',
            low: '#ffdd00'
          };
          
          return (
            <div
              key={`marker-${incident.id}`}
              style={{
                position: 'absolute',
                left: `${safeX}%`,
                top: `${safeY}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 500,
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              title={`${incident.incident_type} - ${incident.location}`}
            >
              {/* Large pulsing incident marker */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: severityColors[incident.severity] || severityColors.medium,
                border: '4px solid white',
                boxShadow: `0 0 0 0 ${severityColors[incident.severity] || severityColors.medium}`,
                animation: 'pulse-incident 2s infinite',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                }}>
                  ⚠️
                </div>
              </div>
              
              {/* Incident area circle */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `${severityColors[incident.severity] || severityColors.medium}20`,
                border: `2px dashed ${severityColors[incident.severity] || severityColors.medium}`,
                animation: 'pulse-area 3s infinite',
                zIndex: -1
              }}></div>
              
              {/* Incident label - always visible */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                border: `2px solid ${severityColors[incident.severity] || severityColors.medium}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
              }}>
                🚨 {incident.incident_type}
                <div style={{
                  fontSize: '9px',
                  color: '#ccc',
                  marginTop: '2px'
                }}>
                  {incident.location}
                </div>
              </div>
            </div>
          );
        })}

        {/* Camera Location Markers Overlay */}
        {cameras.map((camera) => {
          const mapBounds = {
            north: 40.9176,
            south: 40.4774,
            east: -73.7004,
            west: -74.2591
          };
          
          const x = ((camera.longitude - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
          const y = ((mapBounds.north - camera.latitude) / (mapBounds.north - mapBounds.south)) * 100;
          
          const hasAlert = alerts.some(alert => alert.camera_id === camera.camera_id);
          const cameraColor = hasAlert ? '#ff4444' : camera.status === 'active' ? '#00ff88' : '#777';
          
          return (
            <div
              key={`camera-marker-${camera.camera_id}`}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 400,
                pointerEvents: 'none'
              }}
            >
              {/* Camera marker */}
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: cameraColor,
                border: '2px solid white',
                boxShadow: hasAlert ? '0 0 0 0 rgba(255, 68, 68, 1)' : 'none',
                animation: hasAlert ? 'pulse-camera 1.5s infinite' : 'none',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontSize: '6px',
                  fontWeight: 'bold'
                }}>
                  📹
                </div>
              </div>
            </div>
          );
        })}

        {/* Camera Overlay - REPOSITIONED */}
        <div style={{
          position: 'absolute',
          top: '80px',  // Moved down to avoid overlap
          left: '20px',
          background: 'rgba(26, 26, 46, 0.95)',
          border: '1px solid #2a2a3e',
          borderRadius: '8px',
          padding: '15px',
          maxWidth: '300px',
          maxHeight: '350px',  // Reduced height
          overflowY: 'auto',
          zIndex: 1000,
          color: '#fff'
        }}>
          <h4 style={{ color: '#00ff88', margin: '0 0 15px 0', fontSize: '14px' }}>📹 Camera Locations</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cameras.map((cam) => {
              const hasAlert = alerts.some(alert => alert.camera_id === cam.camera_id);
              return (
                <div key={cam.camera_id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  background: hasAlert ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                  borderRadius: '4px',
                  border: `1px solid ${hasAlert ? '#ff4444' : '#00ff88'}`,
                  cursor: 'pointer'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: hasAlert ? '#ff4444' : cam.status === 'active' ? '#00ff88' : '#777'
                  }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#00ff88' }}>
                      {cam.camera_id}
                    </div>
                    <div style={{ fontSize: '10px', color: '#ccc' }}>
                      {cam.location}
                    </div>
                  </div>
                  <button
                    style={{
                      background: '#00ff88',
                      color: '#000',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => openLiveMonitoring(cam)}
                  >
                    <Eye size={10} />
                    View
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Incidents Overlay - FIXED COUNT */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(26, 26, 46, 0.95)',
          border: '1px solid #2a2a3e',
          borderRadius: '8px',
          padding: '15px',
          maxWidth: '300px',
          maxHeight: '400px',
          overflowY: 'auto',
          zIndex: 1000,
          color: '#fff'
        }}>
          <h4 style={{ color: '#ff4444', margin: '0 0 15px 0', fontSize: '14px' }}>
            🚨 Active Incidents ({incidents.filter(inc => inc.status === 'active').length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {incidents.filter(incident => incident.status === 'active').slice(0, 2).map((incident) => (
              <div key={incident.id} style={{
                padding: '12px',
                background: 'rgba(255, 68, 68, 0.15)',
                borderRadius: '6px',
                border: '2px solid #ff4444',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: incident.severity === 'critical' ? '#ff0000' : 
                             incident.severity === 'high' ? '#ff4444' :
                             incident.severity === 'medium' ? '#ffaa00' : '#ffdd00',
                  animation: 'pulse-dot 1s infinite'
                }}></div>
                
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ff4444', marginBottom: '4px' }}>
                  🚨 {incident.incident_type}
                </div>
                <div style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px' }}>
                  📍 {incident.location} - {incident.camera_id}
                </div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>
                  🕒 {new Date(incident.timestamp).toLocaleString()}
                </div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  display: 'inline-block',
                  background: incident.severity === 'critical' ? 'rgba(255, 0, 0, 0.3)' : 
                             incident.severity === 'high' ? 'rgba(255, 68, 68, 0.3)' :
                             incident.severity === 'medium' ? 'rgba(255, 170, 0, 0.3)' : 'rgba(255, 221, 0, 0.3)',
                  color: incident.severity === 'critical' ? '#ff0000' : 
                         incident.severity === 'high' ? '#ff4444' :
                         incident.severity === 'medium' ? '#ffaa00' : '#ffdd00',
                  border: `1px solid ${incident.severity === 'critical' ? '#ff0000' : 
                                      incident.severity === 'high' ? '#ff4444' :
                                      incident.severity === 'medium' ? '#ffaa00' : '#ffdd00'}`
                }}>
                  {incident.severity} PRIORITY
                </div>
              </div>
            ))}
            
            {incidents.filter(inc => inc.status === 'active').length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#888',
                fontSize: '12px'
              }}>
                ✅ No active incidents
                <br />
                <span style={{ fontSize: '10px' }}>System monitoring normally</span>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(26, 26, 46, 0.95)',
          border: '1px solid #2a2a3e',
          borderRadius: '8px',
          padding: '15px',
          zIndex: 1000,
          color: '#fff'
        }}>
          <h4 style={{ color: '#00ff88', margin: '0 0 10px 0', fontSize: '12px' }}>Legend</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00ff88' }}></div>
              <span>Active Camera</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff4444' }}></div>
              <span>Camera with Alert</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#777' }}></div>
              <span>Offline Camera</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityMap;