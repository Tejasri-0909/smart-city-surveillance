import { useAlert } from '../context/AlertContext';
import { X, AlertTriangle, Flame, Shield } from 'lucide-react';

const AlertsPanel = () => {
  const { alerts, removeAlert, clearAllAlerts } = useAlert();

  const getAlertIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire detected':
        return <Flame size={16} className="alert-icon fire" />;
      case 'weapon detected':
        return <Shield size={16} className="alert-icon weapon" />;
      default:
        return <AlertTriangle size={16} className="alert-icon default" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '#ff0000';
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#00ff88';
      default:
        return '#ff4444';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  if (alerts.length === 0) {
    return (
      <div className="alerts-panel">
        <div className="no-alerts">
          <AlertTriangle size={48} className="no-alerts-icon" />
          <p>No active alerts</p>
          <span>System monitoring normally</span>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-panel">
      <div className="alerts-header">
        <span className="alerts-count">{alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''}</span>
        {alerts.length > 0 && (
          <button 
            className="btn btn-sm btn-danger"
            onClick={clearAllAlerts}
          >
            Clear All
          </button>
        )}
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className="alert-item"
            style={{ borderLeftColor: getSeverityColor(alert.severity) }}
          >
            <div className="alert-header">
              <div className="alert-type-container">
                {getAlertIcon(alert.type)}
                <span className="alert-type">{alert.type}</span>
              </div>
              <div className="alert-actions">
                <span className="alert-time">{formatTime(alert.timestamp)}</span>
                <button 
                  className="alert-close"
                  onClick={() => removeAlert(alert.id)}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            
            <div className="alert-message">{alert.message}</div>
            
            {alert.camera_id && (
              <div className="alert-details">
                <span className="alert-camera">Camera: {alert.camera_id}</span>
                {alert.location && (
                  <span className="alert-location">Location: {alert.location}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;