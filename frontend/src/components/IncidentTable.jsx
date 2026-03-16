import { useState } from 'react';
import { Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const IncidentTable = ({ incidents = [] }) => {
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Sample incidents if none provided
  const defaultIncidents = [
    {
      id: 1,
      camera_id: 'CAM002',
      incident_type: 'Weapon Detected',
      location: 'Metro Station',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'active',
      severity: 'high'
    },
    {
      id: 2,
      camera_id: 'CAM001',
      incident_type: 'Suspicious Activity',
      location: 'City Center',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      status: 'resolved',
      severity: 'medium'
    },
    {
      id: 3,
      camera_id: 'CAM003',
      incident_type: 'Fire Detected',
      location: 'Airport Gate',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'false-alarm',
      severity: 'critical'
    }
  ];

  const displayIncidents = incidents.length > 0 ? incidents : defaultIncidents;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { class: 'active', icon: AlertTriangle, text: 'Active' },
      resolved: { class: 'resolved', icon: CheckCircle, text: 'Resolved' },
      'false-alarm': { class: 'false-alarm', icon: XCircle, text: 'False Alarm' }
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span className={`status-badge ${config.class}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return '#ff0000';
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#00ff88';
      default: return '#888';
    }
  };

  const handleViewIncident = (incident) => {
    setSelectedIncident(incident);
  };

  return (
    <div className="incident-table-container">
      <div className="table-wrapper">
        <table className="incident-table">
          <thead>
            <tr>
              <th>Camera ID</th>
              <th>Incident Type</th>
              <th>Location</th>
              <th>Time</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayIncidents.map((incident, index) => (
              <tr key={incident.id || index}>
                <td className="camera-id">{incident.camera_id}</td>
                <td className="incident-type">{incident.incident_type}</td>
                <td className="location">{incident.location}</td>
                <td className="timestamp">{formatTimestamp(incident.timestamp || new Date())}</td>
                <td className="severity">
                  <div 
                    className="severity-indicator"
                    style={{ backgroundColor: getSeverityColor(incident.severity) }}
                  ></div>
                  {incident.severity || 'Medium'}
                </td>
                <td className="status">
                  {getStatusBadge(incident.status)}
                </td>
                <td className="actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleViewIncident(incident)}
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {displayIncidents.length === 0 && (
        <div className="no-incidents">
          <AlertTriangle size={48} className="no-incidents-icon" />
          <p>No incidents recorded</p>
        </div>
      )}

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="incident-modal" onClick={() => setSelectedIncident(null)}>
          <div className="incident-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="incident-modal-header">
              <h3>Incident Details</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedIncident(null)}
              >
                ×
              </button>
            </div>
            
            <div className="incident-modal-body">
              <div className="incident-detail-grid">
                <div className="detail-item">
                  <label>Camera ID:</label>
                  <span>{selectedIncident.camera_id}</span>
                </div>
                <div className="detail-item">
                  <label>Incident Type:</label>
                  <span>{selectedIncident.incident_type}</span>
                </div>
                <div className="detail-item">
                  <label>Location:</label>
                  <span>{selectedIncident.location}</span>
                </div>
                <div className="detail-item">
                  <label>Timestamp:</label>
                  <span>{formatTimestamp(selectedIncident.timestamp || new Date())}</span>
                </div>
                <div className="detail-item">
                  <label>Severity:</label>
                  <span style={{ color: getSeverityColor(selectedIncident.severity) }}>
                    {selectedIncident.severity || 'Medium'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  {getStatusBadge(selectedIncident.status)}
                </div>
              </div>
              
              <div className="incident-actions">
                <button className="btn btn-success">Mark as Resolved</button>
                <button className="btn btn-danger">Mark as False Alarm</button>
                <button className="btn btn-primary">View Camera Feed</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentTable;