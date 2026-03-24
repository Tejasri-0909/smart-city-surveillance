import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Activity, Map } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import SafeCameraGrid from '../components/SafeCameraGrid';
import { getApiUrl, isFallbackMode } from '../config/api';
import { getFallbackCameras } from '../utils/fallbackData';
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

  // Listen for real-time stats updates
  useEffect(() => {
    const handleStatsUpdate = (event) => {
      const updatedStats = event.detail;
      console.log('📈 Dashboard received stats update:', updatedStats);
      
      setStats(prev => ({
        ...prev,
        totalIncidents: updatedStats.total || prev.totalIncidents,
        activeIncidents: updatedStats.active || prev.activeIncidents
      }));
    };

    const handleCameraUpdate = (event) => {
      const updatedCamera = event.detail;
      console.log('📹 Dashboard received camera update:', updatedCamera);
      
      // Refresh camera stats when camera status changes
      fetchCameraStats();
    };

    // Add event listeners for real-time updates
    window.addEventListener('statsUpdate', handleStatsUpdate);
    window.addEventListener('cameraUpdate', handleCameraUpdate);

    return () => {
      window.removeEventListener('statsUpdate', handleStatsUpdate);
      window.removeEventListener('cameraUpdate', handleCameraUpdate);
    };
  }, []);

  // Update stats when incidents change (from AlertContext)
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
      // Check if we're in fallback mode
      if (isFallbackMode()) {
        console.log('📱 Using fallback camera stats');
        const fallbackCameras = getFallbackCameras();
        const activeCameras = fallbackCameras.filter(cam => cam.status === 'active').length;
        
        setStats(prev => ({
          ...prev,
          totalCameras: fallbackCameras.length,
          activeCameras: activeCameras
        }));
        return;
      }
      
      const res = await axios.get(getApiUrl("/cameras"), { timeout: 5000 });
      const cameras = res.data.cameras || [];
      const activeCameras = cameras.filter(cam => cam.status === 'active').length;
      
      setStats(prev => ({
        ...prev,
        totalCameras: cameras.length,
        activeCameras: activeCameras
      }));
    } catch (error) {
      console.error('Error fetching camera stats, using fallback:', error);
      // Use fallback data
      const fallbackCameras = getFallbackCameras();
      const activeCameras = fallbackCameras.filter(cam => cam.status === 'active').length;
      
      setStats(prev => ({
        ...prev,
        totalCameras: fallbackCameras.length,
        activeCameras: activeCameras
      }));
    }
  };

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
        
        {alerts.length === 0 && incidents.filter(inc => inc.status === 'active').length === 0 ? (
          <div className="no-alerts">
            <AlertTriangle size={48} className="no-alerts-icon" />
            <p>No active alerts</p>
            <span>System monitoring normally</span>
          </div>
        ) : (
          <div className="alerts-list">
            {/* Show real alerts first */}
            {alerts.slice(0, 3).map((alert) => (
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
            
            {/* Show active incidents as alerts */}
            {incidents
              .filter(inc => inc.status === 'active' && inc.severity !== 'low')
              .slice(0, 5 - alerts.length)
              .map((incident) => (
                <div key={`incident-${incident.id}`} className="alert-item">
                  <div className="alert-header">
                    <div className="alert-type-container">
                      <AlertTriangle size={16} />
                      <span className="alert-type">{incident.incident_type}</span>
                    </div>
                    <div className="alert-actions">
                      <span className={`severity-badge ${incident.severity}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="alert-time">
                        {new Date(incident.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="alert-message">
                    {incident.description || `${incident.incident_type} detected at ${incident.location}`}
                  </div>
                  <div className="alert-details">
                    <span className="alert-camera">Camera: {incident.camera_id}</span>
                    <span className="alert-location">Location: {incident.location}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;