import { useState } from 'react';
import { Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';

const IncidentTable = ({ incidents = [], onIncidentUpdate }) => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { updateIncidentStatus } = useAlert();

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

  const handleViewCameraFeed = (cameraId) => {
    // Navigate to live monitoring with selected camera
    navigate(`/live-monitoring?camera=${cameraId}`);
    setSelectedIncident(null);
  };

  const handleUpdateIncidentStatus = async (incidentId, newStatus) => {
    setUpdating(true);
    try {
      console.log(`🔄 Updating incident ${incidentId} to status: ${newStatus}`);
      
      // Use the AlertContext method directly - this is how it worked originally
      await updateIncidentStatus(incidentId, newStatus);
      
      // Close modal on success
      setSelectedIncident(null);
      
      // Show success notification
      showNotification(`Incident marked as ${newStatus.replace('-', ' ')}`, 'success');
      
    } catch (error) {
      console.error('❌ Error updating incident status:', error);
      showNotification(`Failed to update incident status: ${error.message}`, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const showNotification = (message, type) => {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = `notification-banner ${type}`;
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
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
            {incidents.map((incident, index) => (
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

      {incidents.length === 0 && (
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
                {selectedIncident.status === 'active' && (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'resolved')}
                      disabled={updating}
                    >
                      <CheckCircle size={16} />
                      {updating ? 'Updating...' : 'Mark as Resolved'}
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleUpdateIncidentStatus(selectedIncident.id, 'false-alarm')}
                      disabled={updating}
                    >
                      <XCircle size={16} />
                      {updating ? 'Updating...' : 'Mark as False Alarm'}
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-primary"
                  onClick={() => handleViewCameraFeed(selectedIncident.camera_id)}
                >
                  <Eye size={16} />
                  View Camera Feed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentTable;