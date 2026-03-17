import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Activity, Map } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import SafeCameraGrid from '../components/SafeCameraGrid';
import { getApiUrl } from '../config/api';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCameras: 6,
    activeCameras: 6,
    totalIncidents: 0,
    activeIncidents: 0
  });
  
  // Use centralized incident data from AlertContext
  const { incidents, alerts, simulateAlert, connectionStatus } = useAlert();
  const navigate = useNavigate();

  // Update stats when incidents change
  useEffect(() => {
    const activeIncidents = incidents.filter(inc => inc.status === 'active').length;
    setStats(prev => ({
      ...prev,
      totalIncidents: incidents.length,
      activeIncidents: activeIncidents
    }));
  }, [incidents]);

  // Fetch camera stats
  useEffect(() => {
    fetchCameraStats();
    
    // Refresh camera data every 30 seconds
    const interval = setInterval(fetchCameraStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCameraStats = async () => {
    try {
      const res = await axios.get(getApiUrl("/cameras"));
      const cameras = res.data.cameras || [];
      const activeCameras = cameras.filter(cam => cam.status === 'active').length;
      
      setStats(prev => ({
        ...prev,
        totalCameras: cameras.length,
        activeCameras: activeCameras
      }));
    } catch (error) {
      console.error("Failed to fetch camera stats:", error);
    }
  };

  // Camera data
  const cameraData = [
    { id: 'CAM001', name: 'City Center' },
    { id: 'CAM002', name: 'Metro Station' },
    { id: 'CAM003', name: 'Airport Gate' },
    { id: 'CAM004', name: 'Shopping Mall' },
    { id: 'CAM005', name: 'Park Entrance' },
    { id: 'CAM006', name: 'Highway Bridge' }
  ];

  const handleViewOnMap = () => {
    navigate('/city-map');
  };

  const handleSimulateAlert = () => {
    simulateAlert();
  };

  return (
    <div className="dashboard-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Camera size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeCameras}/{stats.totalCameras}</div>
            <div className="stat-label">Active Cameras</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon alert">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{alerts.length}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon incident">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeIncidents}/{stats.totalIncidents}</div>
            <div className="stat-label">Active Incidents</div>
          </div>
        </div>
        
        <div className="stat-card map-stat" onClick={handleViewOnMap}>
          <div className="stat-icon">
            <Map size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{incidents.length}</div>
            <div className="stat-label">Map Incidents</div>
            <div className="stat-action">View Map →</div>
          </div>
        </div>
      </div>

      {/* Simple Camera Grid */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">
            <Camera size={20} />
            Live Camera Feed
            <span className="connection-status" style={{
              color: connectionStatus === 'connected' ? '#00ff88' : '#ff4444',
              marginLeft: '10px',
              fontSize: '12px'
            }}>
              {connectionStatus === 'connected' ? '● CONNECTED' : '● DISCONNECTED'}
            </span>
          </h3>
          <div className="section-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleViewOnMap}
            >
              <Map size={14} />
              View on Map
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSimulateAlert}
            >
              Simulate Alert
            </button>
          </div>
        </div>
        
        <SafeCameraGrid />
      </div>

      {/* Simple Alerts Panel */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">
            <AlertTriangle size={20} />
            Recent Alerts
          </h3>
        </div>
        
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <AlertTriangle size={48} className="no-alerts-icon" />
            <p>No active alerts</p>
            <span>System monitoring normally</span>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className="alert-header">
                  <div className="alert-type-container">
                    <AlertTriangle size={16} />
                    <span className="alert-type">{alert.incident_type}</span>
                  </div>
                  <div className="alert-actions">
                    <span className="alert-time">
                      {alert.timestamp}
                    </span>
                  </div>
                </div>
                <div className="alert-message">{alert.message}</div>
                {alert.camera_id && (
                  <div className="alert-details">
                    <span className="alert-camera">Camera: {alert.camera_id}</span>
                    <span className="alert-location">Location: {alert.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;