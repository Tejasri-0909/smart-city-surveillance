import { useState, useEffect } from 'react';
import { useAlert } from '../context/AlertContext';

const CameraGrid = ({ cameras = [] }) => {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [alertingCameras, setAlertingCameras] = useState(new Set());
  const { alerts } = useAlert();

  // Sample cameras if none provided
  const defaultCameras = [
    { camera_id: 'CAM001', location: 'City Center', status: 'active', latitude: 40.7128, longitude: -74.0060 },
    { camera_id: 'CAM002', location: 'Metro Station', status: 'active', latitude: 40.7589, longitude: -73.9851 },
    { camera_id: 'CAM003', location: 'Airport Gate', status: 'active', latitude: 40.6892, longitude: -74.1745 },
    { camera_id: 'CAM004', location: 'Shopping Mall', status: 'active', latitude: 40.7505, longitude: -73.9934 },
    { camera_id: 'CAM005', location: 'Park Entrance', status: 'offline', latitude: 40.7829, longitude: -73.9654 },
    { camera_id: 'CAM006', location: 'Highway Bridge', status: 'active', latitude: 40.7282, longitude: -74.0776 }
  ];

  const displayCameras = cameras.length > 0 ? cameras : defaultCameras;

  useEffect(() => {
    // Update alerting cameras based on recent alerts
    const newAlertingCameras = new Set();
    alerts.forEach(alert => {
      if (alert.camera_id) {
        newAlertingCameras.add(alert.camera_id);
      }
    });
    setAlertingCameras(newAlertingCameras);
  }, [alerts]);

  const handleCameraClick = (camera) => {
    setSelectedCamera(camera);
  };

  const renderDetectionOverlay = (cameraId) => {
    const hasAlert = alertingCameras.has(cameraId);
    if (!hasAlert) return null;

    return (
      <div className="detection-overlay">
        <div className="detection-box">
          <div className="detection-label">⚠ THREAT DETECTED</div>
        </div>
      </div>
    );
  };

  return (
    <div className="camera-monitoring">
      <div className="camera-grid">
        {displayCameras.map((camera) => (
          <div
            key={camera.camera_id}
            className={`camera-card ${alertingCameras.has(camera.camera_id) ? 'active' : ''}`}
            onClick={() => handleCameraClick(camera)}
          >
            <div className="camera-video">
              {/* Simulated video feed */}
              <div className="camera-placeholder">
                <div className="camera-feed-simulation">
                  <div className="feed-lines"></div>
                  <div className="feed-static"></div>
                  {camera.status === 'active' ? (
                    <span>🎥 LIVE</span>
                  ) : (
                    <span>📵 OFFLINE</span>
                  )}
                </div>
              </div>
              {renderDetectionOverlay(camera.camera_id)}
            </div>
            
            <div className="camera-info">
              <div className="camera-name">{camera.camera_id}</div>
              <div className="camera-location">{camera.location}</div>
              <div className="camera-status">
                <div className={`status-dot ${camera.status === 'offline' ? 'offline' : ''}`}></div>
                <span>{camera.status?.toUpperCase() || 'ACTIVE'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Camera Selection Panel */}
      {selectedCamera && (
        <div className="camera-detail-modal" onClick={() => setSelectedCamera(null)}>
          <div className="camera-detail-content" onClick={(e) => e.stopPropagation()}>
            <div className="camera-detail-header">
              <h3>{selectedCamera.camera_id} - {selectedCamera.location}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedCamera(null)}
              >
                ×
              </button>
            </div>
            
            <div className="camera-detail-video">
              <div className="large-camera-placeholder">
                <div className="large-feed-simulation">
                  <div className="feed-lines"></div>
                  <div className="feed-static"></div>
                  <span>🎥 LIVE FEED - {selectedCamera.camera_id}</span>
                </div>
              </div>
              {renderDetectionOverlay(selectedCamera.camera_id)}
            </div>
            
            <div className="camera-controls">
              <button className="btn btn-primary">Record</button>
              <button className="btn btn-primary">Snapshot</button>
              <button className="btn btn-danger">Report Incident</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraGrid;