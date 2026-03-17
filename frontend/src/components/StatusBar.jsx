import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, Activity, AlertCircle } from 'lucide-react';
import { useAlert } from '../context/AlertContext';

const StatusBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('online');
  const { alerts, connectionStatus, connectionAttempts } = useAlert();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getStatusIndicator = () => {
    if (connectionStatus === 'error' || connectionStatus === 'disconnected') return 'error';
    if (alerts.length > 0) return 'warning';
    return 'online';
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi size={16} />;
      case 'connecting':
        return <Activity size={16} className="animate-pulse" />;
      case 'disconnected':
      case 'error':
        return <WifiOff size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#00ff88';
      case 'connecting':
        return '#ffaa00';
      case 'disconnected':
        return '#ff4444';
      case 'error':
        return '#ff4444';
      default:
        return '#888';
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'CONNECTED';
      case 'connecting':
        return 'CONNECTING...';
      case 'disconnected':
        return `DISCONNECTED ${connectionAttempts > 0 ? `(Retry ${connectionAttempts})` : ''}`;
      case 'error':
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="status-item">
          <div className={`status-indicator ${getStatusIndicator()}`}></div>
          <span>System Status: {systemStatus.toUpperCase()}</span>
        </div>
        
        <div className="status-item">
          <Database size={16} />
          <span>Database: CONNECTED</span>
        </div>
        
        <div className="status-item">
          <Activity size={16} />
          <span>AI Engine: ACTIVE</span>
        </div>
        
        <div className="status-item">
          <div style={{ color: getConnectionColor() }}>
            {getConnectionIcon()}
          </div>
          <span style={{ color: getConnectionColor() }}>
            WebSocket: {getConnectionText()}
          </span>
        </div>

        {connectionStatus === 'error' && (
          <div className="status-item" style={{ color: '#ff4444' }}>
            <AlertCircle size={16} />
            <span>Backend Server Not Running</span>
          </div>
        )}
      </div>
      
      <div className="status-right">
        {alerts.length > 0 && (
          <div className="alert-counter">
            {alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''}
          </div>
        )}
        
        <div className="current-time">
          {formatTime(currentTime)}
        </div>
      </div>
    </div>
  );
};

export default StatusBar;