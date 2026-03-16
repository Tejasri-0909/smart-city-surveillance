import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Activity, MapPin } from 'lucide-react';
import { useAlert } from '../context/AlertContext';
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
  const { alerts, simulateAlert } = useAlert();

  useEffect(() => {
    fetchCameras();
    fetchIncidents();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/cameras');
      const cameraData = response.data.cameras;
      setCameras(cameraData);
      
      setStats(prev => ({
        ...prev,
        totalCameras: cameraData.length,
        activeCameras: cameraData.filter(cam => cam.status === 'active').length
      }));
    } catch (error) {
      console.error('Error fetching cameras:', error);
    }
  };

  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/incidents');
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
        
        <div className="stat-card">
          <div className="stat-icon">
            <MapPin size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">12</div>
            <div className="stat-label">Monitored Areas</div>
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
            <button 
              className="btn btn-primary"
              onClick={() => simulateAlert('weapon_detected')}
            >
              Simulate Alert
            </button>
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
          </div>
          <IncidentTable incidents={incidents.slice(0, 10)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;