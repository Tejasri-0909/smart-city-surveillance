import React from 'react';
import { useAlert } from '../context/AlertContext';
import { API_CONFIG } from '../config/api';

const DeploymentStatus = () => {
  const { connectionStatus, connectionAttempts } = useAlert();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10b981'; // green
      case 'connecting': return '#f59e0b'; // yellow
      case 'disconnected': return '#ef4444'; // red
      case 'error': return '#dc2626'; // dark red
      default: return '#6b7280'; // gray
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected to Render Backend';
      case 'connecting': return 'Connecting to Backend...';
      case 'disconnected': return 'Disconnected from Backend';
      case 'error': return 'Connection Error';
      default: return 'Unknown Status';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getStatusColor(),
        animation: connectionStatus === 'connecting' ? 'pulse 2s infinite' : 'none'
      }} />
      <span>{getStatusText()}</span>
      {connectionAttempts > 0 && (
        <span style={{ opacity: 0.7 }}>
          (Attempt {connectionAttempts})
        </span>
      )}
      <div style={{ fontSize: '10px', opacity: 0.6 }}>
        🚀 Production (Render)
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default DeploymentStatus;