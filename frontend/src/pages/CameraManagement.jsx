import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Camera, Wifi, WifiOff } from 'lucide-react';
import axios from 'axios';

const CameraManagement = () => {
  const [cameras, setCameras] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [formData, setFormData] = useState({
    camera_id: '',
    location: '',
    latitude: '',
    longitude: '',
    status: 'active',
    stream_url: ''
  });

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/cameras');
      setCameras(response.data.cameras);
    } catch (error) {
      console.error('Error fetching cameras:', error);
      // Use sample data for demo
      const sampleCameras = [
        {
          camera_id: 'CAM001',
          location: 'City Center',
          latitude: 40.7128,
          longitude: -74.0060,
          status: 'active',
          stream_url: 'rtsp://example.com/stream1'
        },
        {
          camera_id: 'CAM002',
          location: 'Metro Station',
          latitude: 40.7589,
          longitude: -73.9851,
          status: 'active',
          stream_url: 'rtsp://example.com/stream2'
        }
      ];
      setCameras(sampleCameras);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCamera) {
        // Update existing camera
        const response = await axios.put(`http://127.0.0.1:8000/cameras/${editingCamera.camera_id}`, formData);
        setCameras(prev => prev.map(cam => 
          cam.camera_id === editingCamera.camera_id ? formData : cam
        ));
      } else {
        // Add new camera
        const response = await axios.post('http://127.0.0.1:8000/cameras/register', formData);
        setCameras(prev => [...prev, formData]);
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving camera:', error);
      // For demo, just update local state
      if (editingCamera) {
        setCameras(prev => prev.map(cam => 
          cam.camera_id === editingCamera.camera_id ? formData : cam
        ));
      } else {
        setCameras(prev => [...prev, { ...formData, id: Date.now() }]);
      }
      resetForm();
    }
  };

  const handleEdit = (camera) => {
    setEditingCamera(camera);
    setFormData(camera);
    setShowAddModal(true);
  };

  const handleDelete = async (cameraId) => {
    if (window.confirm('Are you sure you want to delete this camera?')) {
      try {
        await axios.delete(`http://127.0.0.1:8000/cameras/${cameraId}`);
        setCameras(prev => prev.filter(cam => cam.camera_id !== cameraId));
      } catch (error) {
        console.error('Error deleting camera:', error);
        // For demo, just update local state
        setCameras(prev => prev.filter(cam => cam.camera_id !== cameraId));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      camera_id: '',
      location: '',
      latitude: '',
      longitude: '',
      status: 'active',
      stream_url: ''
    });
    setEditingCamera(null);
    setShowAddModal(false);
  };

  const toggleCameraStatus = async (cameraId) => {
    const camera = cameras.find(cam => cam.camera_id === cameraId);
    const newStatus = camera.status === 'active' ? 'offline' : 'active';
    
    try {
      await axios.patch(`http://127.0.0.1:8000/cameras/${cameraId}/status`, { status: newStatus });
      setCameras(prev => prev.map(cam => 
        cam.camera_id === cameraId ? { ...cam, status: newStatus } : cam
      ));
    } catch (error) {
      console.error('Error updating camera status:', error);
      // For demo, just update local state
      setCameras(prev => prev.map(cam => 
        cam.camera_id === cameraId ? { ...cam, status: newStatus } : cam
      ));
    }
  };

  return (
    <div className="camera-management">
      <div className="management-header">
        <div>
          <h2>Camera Management</h2>
          <p>Register and manage CCTV cameras across the surveillance network</p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} />
          Add Camera
        </button>
      </div>

      {/* Camera Grid */}
      <div className="camera-management-grid">
        {cameras.map((camera) => (
          <div key={camera.camera_id} className="camera-management-card">
            <div className="camera-card-header">
              <div className="camera-title">
                <Camera size={20} />
                <span>{camera.camera_id}</span>
              </div>
              <div className="camera-status-toggle">
                <button
                  className={`status-btn ${camera.status === 'active' ? 'active' : 'offline'}`}
                  onClick={() => toggleCameraStatus(camera.camera_id)}
                >
                  {camera.status === 'active' ? <Wifi size={16} /> : <WifiOff size={16} />}
                </button>
              </div>
            </div>
            
            <div className="camera-card-body">
              <div className="camera-info-item">
                <MapPin size={14} />
                <span>{camera.location}</span>
              </div>
              
              <div className="camera-coordinates">
                <span>Lat: {camera.latitude}</span>
                <span>Lng: {camera.longitude}</span>
              </div>
              
              <div className="camera-stream">
                <span className="stream-label">Stream URL:</span>
                <span className="stream-url">{camera.stream_url || 'Not configured'}</span>
              </div>
              
              <div className={`camera-status-badge ${camera.status}`}>
                {camera.status?.toUpperCase()}
              </div>
            </div>
            
            <div className="camera-card-actions">
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => handleEdit(camera)}
              >
                <Edit size={14} />
                Edit
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(camera.camera_id)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {cameras.length === 0 && (
        <div className="no-cameras">
          <Camera size={48} />
          <h3>No cameras registered</h3>
          <p>Add your first camera to start monitoring</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Add Camera
          </button>
        </div>
      )}

      {/* Add/Edit Camera Modal */}
      {showAddModal && (
        <div className="camera-modal" onClick={resetForm}>
          <div className="camera-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="camera-modal-header">
              <h3>{editingCamera ? 'Edit Camera' : 'Add New Camera'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="camera-form">
              <div className="form-group">
                <label>Camera ID</label>
                <input
                  type="text"
                  value={formData.camera_id}
                  onChange={(e) => setFormData({...formData, camera_id: e.target.value})}
                  placeholder="e.g., CAM001"
                  required
                  disabled={editingCamera}
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., City Center"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                    placeholder="40.7128"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                    placeholder="-74.0060"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Stream URL</label>
                <input
                  type="url"
                  value={formData.stream_url}
                  onChange={(e) => setFormData({...formData, stream_url: e.target.value})}
                  placeholder="rtsp://example.com/stream"
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="offline">Offline</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCamera ? 'Update Camera' : 'Add Camera'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraManagement;