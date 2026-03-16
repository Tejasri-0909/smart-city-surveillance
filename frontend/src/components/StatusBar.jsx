import { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';

const StatusBar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('online');
  const { alerts } = useAlert();

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
    if (alerts.length > 0) return 'error';
    return 'online';
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="status-item">
          <div className={`status-indicator ${getStatusIndicator()}`}></div>
          <span>System Status: {systemStatus.toUpperCase()}</span>
        </div>
        
        <div className="status-item">
          <div className="status-indicator"></div>
          <span>Database: CONNECTED</span>
        </div>
        
        <div className="status-item">
          <div className="status-indicator"></div>
          <span>AI Engine: ACTIVE</span>
        </div>
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