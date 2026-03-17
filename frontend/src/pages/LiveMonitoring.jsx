import { useState, useEffect } from 'react';
import { Camera, Grid, Maximize2, Play, Square, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import CameraVideo from '../components/CameraVideo';
import { getApiUrl, isFallbackMode } from '../config/api';
import { getFallbackCameras } from '../utils/fallbackData';
import axios from 'axios';

const LiveMonitoring = () => {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'single'
  const [isRecording, setIsRecording] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleBackToMap = () => {
    navigate('/city-map');
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  useEffect(() => {
    // Check if camera is specified in URL params
    const urlParams = new URLSearchParams(location.search);
    const cameraParam = urlParams.get('camera');
    
    if (cameraParam && cameras.length > 0) {
      const camera = cameras.find(cam => cam.camera_id === cameraParam);
      if (camera) {
        setSelectedCamera(camera);
        setViewMode('single');
      }
    }
  }, [location.search, cameras]);

  const fetchCameras = async () => {
    try {
      // Check if we're in fallback mode
      if (isFallbackMode()) {
        console.log('📱 Using fallback camera data');
        const fallbackCameras = getFallbackCameras();
        setCameras(fallbackCameras);
        if (fallbackCameras.length > 0 && !selectedCamera) {
          setSelectedCamera(fallbackCameras[0]);
        }
        return;
      }
      
      const response = await axios.get(getApiUrl('/cameras'), { timeout: 5000 });
      setCameras(response.data.cameras);
      if (response.data.cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(response.data.cameras[0]);
      }
    } catch (error) {
      console.error('Error fetching cameras, using fallback:', error);
      // Use fallback cameras
      const fallbackCameras = getFallbackCameras();
      setCameras(fallbackCameras);
      if (fallbackCameras.length > 0 && !selectedCamera) {
        setSelectedCamera(fallbackCameras[0]);
      }
    }
  };
        { camera_id: 'CAM004', location: 'Shopping Mall', status: 'active' },
        { camera_id: 'CAM005', location: 'Park Entrance', status: 'active' },
        { camera_id: 'CAM006', location: 'Highway Bridge', status: 'active' }
      ];
      setCameras(defaultCameras);
      if (!selectedCamera) {
        setSelectedCamera(defaultCameras[0]);
      }
    }
  };

  const handleCameraSelect = (camera) => {
    setSelectedCamera(camera);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const renderCameraFeed = (camera, isLarge = false) => {
    const cameraIndex = parseInt(camera.camera_id.replace('CAM00', ''));
    
    return (
      <div className={`camera-feed ${isLarge ? 'large' : ''}`}>
        <div className="feed-header">
          <span className="camera-label">{camera.camera_id} - {camera.location}</span>
          <div className="feed-status">
            <div className={`status-dot ${camera.status === 'offline' ? 'offline' : 'active'}`}></div>
            <span>{camera.status?.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="video-container">
          <CameraVideo 
            cameraId={camera.camera_id}
            cameraName={camera.location}
            index={cameraIndex}
          />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            className="btn btn-secondary"
            onClick={handleBackToMap}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} />
            Back to Map
          </button>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera size={24} />
            Live CCTV Monitoring
          </h2>
        </div>
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
                    <div className={`status-indicator ${camera.status === 'offline' ? 'offline' : 'active'}`}></div>
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