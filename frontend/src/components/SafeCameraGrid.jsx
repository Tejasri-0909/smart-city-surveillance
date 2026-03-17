import { useState, useEffect } from 'react';
import { Camera, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import CameraVideo from './CameraVideo';
import { useAlert } from '../context/AlertContext';

const SafeCameraGrid = () => {
  const [cameraStats, setCameraStats] = useState({
    total: 6,
    active: 6,
    offline: 0
  });
  const { connectionStatus } = useAlert();

  const cameraData = [
    { id: 'CAM001', name: 'City Center', status: 'active' },
    { id: 'CAM002', name: 'Metro Station', status: 'active' },
    { id: 'CAM003', name: 'Airport Gate', status: 'active' },
    { id: 'CAM004', name: 'Shopping Mall', status: 'active' },
    { id: 'CAM005', name: 'Park Entrance', status: 'active' },
    { id: 'CAM006', name: 'Highway Bridge', status: 'active' }
  ];

  useEffect(() => {
    // Update camera stats based on connection status
    const activeCount = connectionStatus === 'connected' ? 6 : 0;
    setCameraStats({
      total: 6,
      active: activeCount,
      offline: 6 - activeCount
    });
  }, [connectionStatus]);

  return (
    <div className="safe-camera-grid">
      <div className="grid-header">
        <div className="grid-title">
          <Camera size={20} />
          <span>Live Camera Feed</span>
          <div className="connection-indicator">
            {connectionStatus === 'connected' ? (
              <><Wifi size={16} className="connected" /> CONNECTED</>
            ) : (
              <><WifiOff size={16} className="disconnected" /> DISCONNECTED</>
            )}
          </div>
        </div>
        <div className="grid-stats">
          <span className="stat active">{cameraStats.active} Active</span>
          <span className="stat offline">{cameraStats.offline} Offline</span>
        </div>
      </div>

      <div className="camera-grid-container">
        {cameraData.map((camera, index) => (
          <div key={camera.id} className="camera-grid-item">
            <div className="camera-wrapper">
              <CameraVideo 
                cameraId={camera.id}
                cameraName={camera.name}
                index={index + 1}
              />
              <div className="camera-footer">
                <div className="camera-details">
                  <span className="camera-id">{camera.id}</span>
                  <span className="camera-name">{camera.name}</span>
                </div>
                <div className="camera-status-indicator">
                  <div className={`status-dot ${camera.status}`}></div>
                  <span>{camera.status.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {connectionStatus !== 'connected' && (
        <div className="connection-warning">
          <AlertTriangle size={20} />
          <span>Backend server disconnected. Camera feeds may show simulated content.</span>
        </div>
      )}
    </div>
  );
};

export default SafeCameraGrid;