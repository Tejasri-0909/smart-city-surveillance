import { useState, useEffect } from 'react';
import { Camera, Grid, Maximize2, Play, Square } from 'lucide-react';
import axios from 'axios';

const LiveMonitoring = () => {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'single'
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/cameras');
      setCameras(response.data.cameras);
      if (response.data.cameras.length > 0) {
        setSelectedCamera(response.data.cameras[0]);
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
      // Use default cameras for demo
      const defaultCameras = [
        { camera_id: 'CAM001', location: 'City Center', status: 'active' },
        { camera_id: 'CAM002', location: 'Metro Station', status: 'active' },
        { camera_id: 'CAM003', location: 'Airport Gate', status: 'active' },
        { camera_id: 'CAM004', location: 'Shopping Mall', status: 'active' },
        { camera_id: 'CAM005', location: 'Park Entrance', status: 'offline' },
        { camera_id: 'CAM006', location: 'Highway Bridge', status: 'active' }
      ];
      setCameras(defaultCameras);
      setSelectedCamera(defaultCameras[0]);
    }
  };
  const handleCameraSelect = (camera) => {
    setSelectedCamera(camera);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const renderCameraFeed = (camera, isLarge = false) => {
    return (
      <div className={`camera-feed ${isLarge ? 'large' : ''}`}>
        <div className="feed-header">
          <span className="camera-label">{camera.camera_id} - {camera.location}</span>
          <div className="feed-status">
            <div className={`status-dot ${camera.status === 'offline' ? 'offline' : ''}`}></div>
            <span>{camera.status?.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="video-container">
          <div className="video-placeholder">
            <div className="feed-simulation">
              <div className="scan-lines"></div>
              <div className="static-noise"></div>
              {camera.status === 'active' ? (
                <div className="live-indicator">
                  <div className="live-dot"></div>
                  <span>LIVE</span>
                </div>
              ) : (
                <div className="offline-indicator">
                  <span>OFFLINE</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isLarge && (
          <div className="feed-controls">
            <button 
              className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggleRecording}
            >
              {isRecording ? <Square size={16} /> : <Play size={16} />}
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <button className="btn btn-primary">
              <Camera size={16} />
              Snapshot
            </button>
            <button className="btn btn-primary">
              <Maximize2 size={16} />
              Fullscreen
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="live-monitoring">
      <div className="monitoring-header">
        <h2>Live CCTV Monitoring</h2>
        <div className="view-controls">
          <button 
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
            Grid View
          </button>
          <button 
            className={`btn ${viewMode === 'single' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('single')}
          >
            <Maximize2 size={16} />
            Single View
          </button>
        </div>
      </div>

      <div className="monitoring-content">
        {viewMode === 'grid' ? (
          <div className="camera-grid-view">
            {cameras.map((camera) => (
              <div 
                key={camera.camera_id}
                className="grid-camera-item"
                onClick={() => handleCameraSelect(camera)}
              >
                {renderCameraFeed(camera)}
              </div>
            ))}
          </div>
        ) : (
          <div className="single-view-layout">
            <div className="camera-selector">
              <h3>Camera Selection</h3>
              <div className="camera-list">
                {cameras.map((camera) => (
                  <div 
                    key={camera.camera_id}
                    className={`camera-list-item ${selectedCamera?.camera_id === camera.camera_id ? 'active' : ''}`}
                    onClick={() => handleCameraSelect(camera)}
                  >
                    <div className="camera-info">
                      <span className="camera-id">{camera.camera_id}</span>
                      <span className="camera-location">{camera.location}</span>
                    </div>
                    <div className={`status-indicator ${camera.status === 'offline' ? 'offline' : ''}`}></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="main-camera-view">
              {selectedCamera && renderCameraFeed(selectedCamera, true)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMonitoring;