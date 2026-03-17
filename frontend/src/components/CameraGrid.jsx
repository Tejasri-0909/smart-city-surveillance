import { useState, useEffect, useRef } from 'react';
import { useAlert } from '../context/AlertContext';
import { Camera, Record, Square, Maximize2, Download } from 'lucide-react';

const CameraGrid = ({ cameras = [] }) => {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [alertingCameras, setAlertingCameras] = useState(new Set());
  const [recordingCameras, setRecordingCameras] = useState(new Set());
  const { alerts } = useAlert();
  const videoRefs = useRef({});

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

  const getVideoSource = (cameraId) => {
    // Map camera IDs to video files
    const videoMap = {
      'CAM001': 'https://res.cloudinary.com/dybci4h1u/video/upload/v1773771961/cam1_funvna.mp4',
      'CAM002': 'https://res.cloudinary.com/dybci4h1u/video/upload/v1773771935/cam2_euevgq.mp4', 
      'CAM003': 'https://res.cloudinary.com/dybci4h1u/video/upload/v1773771955/cam3_sug2zm.mp4',
      'CAM004': 'https://res.cloudinary.com/dybci4h1u/video/upload/v1773771984/cam4_xexpfj.mp4',
      'CAM005': 'https://res.cloudinary.com/dybci4h1u/video/upload/v1773773966/Cam5_gefgvz.mp4',
      'CAM006': 'https://res.cloudinary.com/dybci4h1u/video/upload/v1773774617/Cam6_bwq6kd.mp4'
    };
    return videoMap[cameraId] || 'https://res.cloudinary.com/dybci4h1u/video/upload/v1773771961/cam1_funvna.mp4';
  };

  const handleStartRecording = async (cameraId) => {
    setRecordingCameras(prev => new Set([...prev, cameraId]));
    
    // Simulate recording for 10 seconds
    setTimeout(() => {
      setRecordingCameras(prev => {
        const newSet = new Set(prev);
        newSet.delete(cameraId);
        return newSet;
      });
      
      // Show notification
      showNotification(`Recording saved for ${cameraId}`, 'success');
    }, 10000);
    
    showNotification(`Recording started for ${cameraId}`, 'info');
  };

  const handleTakeSnapshot = async (cameraId) => {
    const video = videoRefs.current[cameraId];
    if (!video) return;

    try {
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cameraId}_snapshot_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        a.click();
        URL.revokeObjectURL(url);
      });
      
      showNotification(`Snapshot captured for ${cameraId}`, 'success');
    } catch (error) {
      console.error('Error taking snapshot:', error);
      showNotification('Failed to capture snapshot', 'error');
    }
  };

  const handleFullscreen = (cameraId) => {
    const video = videoRefs.current[cameraId];
    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
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

  const renderVideoFeed = (camera) => {
    const videoSrc = getVideoSource(camera.camera_id);
    const isRecording = recordingCameras.has(camera.camera_id);
    
    return (
      <div className="camera-video-container">
        <video
          ref={el => videoRefs.current[camera.camera_id] = el}
          className="camera-video"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            console.log(`Video failed to load for ${camera.camera_id}, using fallback`);
            // Fallback to placeholder if video fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        
        {/* Fallback placeholder */}
        <div className="camera-placeholder" style={{ display: 'none' }}>
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

        {/* Camera overlay info */}
        <div className="camera-overlay">
          <div className="camera-overlay-top">
            <span className="camera-id">{camera.camera_id}</span>
            <div className="live-indicator">
              <div className="live-dot"></div>
              <span>LIVE</span>
            </div>
          </div>
          
          <div className="camera-overlay-bottom">
            <span className="camera-location">{camera.location}</span>
            {isRecording && (
              <div className="recording-indicator">
                <div className="recording-dot"></div>
                <span>REC</span>
              </div>
            )}
          </div>
        </div>

        {/* Detection overlay */}
        {renderDetectionOverlay(camera.camera_id)}
      </div>
    );
  };

  return (
    <div className="camera-monitoring">
      <div className="camera-grid">
        {displayCameras.map((camera) => (
          <div
            key={camera.camera_id}
            className={`camera-card ${alertingCameras.has(camera.camera_id) ? 'active' : ''} ${camera.status === 'offline' ? 'offline' : ''}`}
            onClick={() => handleCameraClick(camera)}
          >
            {renderVideoFeed(camera)}
            
            <div className="camera-info">
              <div className="camera-name">{camera.camera_id}</div>
              <div className="camera-location">{camera.location}</div>
              <div className="camera-status">
                <div className={`status-dot ${camera.status === 'offline' ? 'offline' : ''}`}></div>
                <span>{camera.status?.toUpperCase() || 'ACTIVE'}</span>
              </div>
            </div>

            {/* Camera controls */}
            <div className="camera-controls">
              <button 
                className="control-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartRecording(camera.camera_id);
                }}
                disabled={recordingCameras.has(camera.camera_id)}
                title="Start Recording"
              >
                {recordingCameras.has(camera.camera_id) ? <Square size={14} /> : <Record size={14} />}
              </button>
              
              <button 
                className="control-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTakeSnapshot(camera.camera_id);
                }}
                title="Take Snapshot"
              >
                <Camera size={14} />
              </button>
              
              <button 
                className="control-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFullscreen(camera.camera_id);
                }}
                title="Fullscreen"
              >
                <Maximize2 size={14} />
              </button>
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
              {renderVideoFeed(selectedCamera)}
            </div>
            
            <div className="camera-controls-large">
              <button 
                className="btn btn-primary"
                onClick={() => handleStartRecording(selectedCamera.camera_id)}
                disabled={recordingCameras.has(selectedCamera.camera_id)}
              >
                {recordingCameras.has(selectedCamera.camera_id) ? <Square size={16} /> : <Record size={16} />}
                {recordingCameras.has(selectedCamera.camera_id) ? 'Recording...' : 'Record'}
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleTakeSnapshot(selectedCamera.camera_id)}
              >
                <Camera size={16} />
                Snapshot
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleFullscreen(selectedCamera.camera_id)}
              >
                <Maximize2 size={16} />
                Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraGrid;