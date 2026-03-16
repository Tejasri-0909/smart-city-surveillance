import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Activity, MapPin, Map } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import CameraGrid from '../components/CameraGrid';
import AlertsPanel from '../components/AlertsPanel';
import IncidentTable from '../components/IncidentTable';
import axios from 'axios';

const Dashboard = () => {
  const [cameras, setCameras] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({
    totalCameras: 0,
    activeCameras: 0,
    totalIncidents: 0,
    activeIncidents: 0
  });
  const { alerts, simulateAlert, getRecentIncidents } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCameras();
    fetchIncidents();
    fetchMapStatistics();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/map/cameras-with-status');
      const cameraData = response.data.cameras;
      setCameras(cameraData);
      
      setStats(prev => ({
        ...prev,
        totalCameras: cameraData.length,
        activeCameras: cameraData.filter(cam => cam.status === 'active').length
      }));
    } catch (error) {
      console.error('Error fetching cameras:', error);
      // Fallback to regular camera endpoint
      try {
        const response = await axios.get('http://127.0.0.1:8000/cameras');
        const cameraData = response.data.cameras;
        setCameras(cameraData);
        
        setStats(prev => ({
          ...prev,
          totalCameras: cameraData.length,
          activeCameras: cameraData.filter(cam => cam.status === 'active').length
        }));
      } catch (fallbackError) {
        console.error('Error fetching cameras (fallback):', fallbackError);
      }
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/incidents?limit=20');
      const incidentData = response.data.incidents;
      setIncidents(incidentData);
      
      setStats(prev => ({
        ...prev,
        totalIncidents: incidentData.length,
        activeIncidents: incidentData.filter(inc => inc.status === 'active').length
      }));
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const fetchMapStatistics = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/map/map-statistics');
      const mapStats = response.data;
      
      setStats(prev => ({
        ...prev,
        totalCameras: mapStats.cameras.total,
        activeCameras: mapStats.cameras.active,
        activeIncidents: mapStats.incidents.active
      }));
    } catch (error) {
      console.error('Error fetching map statistics:', error);
    }
  };

  const handleViewOnMap = () => {
    navigate('/city-map');
  };

  const handleSimulateMapIncident = async () => {
    try {
      await axios.post('http://127.0.0.1:8000/map/simulate-incident-on-map');
      // Refresh data after simulation
      setTimeout(() => {
        fetchIncidents();
        fetchCameras();
      }, 1000);
    } catch (error) {
      console.error('Error simulating map incident:', error);
      // Fallback to local simulation
      simulateAlert('weapon_detected');
    }
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
            <div className="stat-number">12</div>
            <div className="stat-label">Monitored Areas</div>
            <div className="stat-action">View Map →</div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-section camera-section">
          <div className="section-header">
            <h3 className="section-title">
              <Camera size={20} />
              Live Camera Feed
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
                onClick={handleSimulateMapIncident}
              >
                Simulate Alert
              </button>
            </div>
          </div>
          <CameraGrid cameras={cameras} />
        </div>

        <div className="dashboard-section alerts-section">
          <div className="section-header">
            <h3 className="section-title">
              <AlertTriangle size={20} />
              Recent Alerts
            </h3>
          </div>
          <AlertsPanel />
        </div>

        <div className="dashboard-section incidents-section">
          <div className="section-header">
            <h3 className="section-title">
              <Activity size={20} />
              Recent Incidents
            </h3>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={handleViewOnMap}
            >
              <MapPin size={14} />
              View Locations
            </button>
          </div>
          <IncidentTable incidents={incidents.slice(0, 10)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;