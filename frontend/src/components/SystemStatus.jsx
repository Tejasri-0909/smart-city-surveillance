import { useState, useEffect } from 'react';
import { 
  Wifi, WifiOff, Database, Activity, AlertCircle, 
  CheckCircle, Clock, Server, Camera 
} from 'lucide-react';
import { useAlert } from '../context/AlertContext';
import { getApiUrl } from '../config/api';

const SystemStatus = () => {
  const [systemHealth, setSystemHealth] = useState({
    backend: 'checking',
    database: 'checking',
    ai: 'checking',
    cameras: 'checking'
  });
  const { connectionStatus, connectionAttempts } = useAlert();

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    try {
      // Check backend health
      const response = await fetch(getApiUrl('/health'));
      if (response.ok) {
        const data = await response.json();
        setSystemHealth({
          backend: 'healthy',
          database: data.database === 'connected' ? 'healthy' : 'error',
          ai: 'healthy',
          cameras: data.camera_status ? 'healthy' : 'warning'
        });
      } else {
        setSystemHealth({
          backend: 'error',
          database: 'error',
          ai: 'error',
          cameras: 'error'
        });
      }
    } catch (error) {
      setSystemHealth({
        backend: 'error',
        database: 'error',
        ai: 'error',
        cameras: 'error'
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={16} className="status-healthy" />;
      case 'warning':
        return <AlertCircle size={16} className="status-warning" />;
      case 'error':
        return <AlertCircle size={16} className="status-error" />;
      case 'checking':
        return <Clock size={16} className="status-checking" />;
      default:
        return <AlertCircle size={16} className="status-unknown" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'OPERATIONAL';
      case 'warning':
        return 'WARNING';
      case 'error':
        return 'ERROR';
      case 'checking':
        return 'CHECKING...';
      default:
        return 'UNKNOWN';
    }
  };

  const getWebSocketStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return { icon: <Wifi size={16} />, text: 'CONNECTED', class: 'status-healthy' };
      case 'connecting':
        return { icon: <Activity size={16} />, text: 'CONNECTING...', class: 'status-warning' };
      case 'disconnected':
        return { icon: <WifiOff size={16} />, text: `DISCONNECTED ${connectionAttempts > 0 ? `(${connectionAttempts})` : ''}`, class: 'status-error' };
      case 'error':
        return { icon: <WifiOff size={16} />, text: 'ERROR', class: 'status-error' };
      default:
        return { icon: <Activity size={16} />, text: 'UNKNOWN', class: 'status-unknown' };
    }
  };

  const wsStatus = getWebSocketStatus();

  return (
    <div className="system-status">
      <div className="status-header">
        <h3>System Status</h3>
        <div className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="status-grid">
        <div className="status-item">
          <div className="status-icon">
            <Server size={20} />
          </div>
          <div className="status-info">
            <div className="status-label">Backend Server</div>
            <div className="status-value">
              {getStatusIcon(systemHealth.backend)}
              <span>{getStatusText(systemHealth.backend)}</span>
            </div>
          </div>
        </div>

        <div className="status-item">
          <div className="status-icon">
            <Database size={20} />
          </div>
          <div className="status-info">
            <div className="status-label">Database</div>
            <div className="status-value">
              {getStatusIcon(systemHealth.database)}
              <span>{getStatusText(systemHealth.database)}</span>
            </div>
          </div>
        </div>

        <div className="status-item">
          <div className="status-icon">
            <Activity size={20} />
          </div>
          <div className="status-info">
            <div className="status-label">AI Engine</div>
            <div className="status-value">
              {getStatusIcon(systemHealth.ai)}
              <span>{getStatusText(systemHealth.ai)}</span>
            </div>
          </div>
        </div>

        <div className="status-item">
          <div className="status-icon">
            <Camera size={20} />
          </div>
          <div className="status-info">
            <div className="status-label">Camera System</div>
            <div className="status-value">
              {getStatusIcon(systemHealth.cameras)}
              <span>{getStatusText(systemHealth.cameras)}</span>
            </div>
          </div>
        </div>

        <div className="status-item">
          <div className="status-icon">
            {wsStatus.icon}
          </div>
          <div className="status-info">
            <div className="status-label">WebSocket</div>
            <div className="status-value">
              <span className={wsStatus.class}>{wsStatus.text}</span>
            </div>
          </div>
        </div>
      </div>

      {(systemHealth.backend === 'error' || connectionStatus === 'error') && (
        <div className="status-alert">
          <AlertCircle size={16} />
          <span>System issues detected. Some features may not work properly.</span>
        </div>
      )}
    </div>
  );
};

export default SystemStatus;