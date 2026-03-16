import { createContext, useContext, useState, useEffect } from 'react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [socket, setSocket] = useState(null);
  const [cameraStatuses, setCameraStatuses] = useState(new Map());
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/realtime/alerts');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        // Trigger re-render to recreate connection
        setSocket(null);
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'alert':
        addAlert({
          type: data.alert_type,
          message: data.message,
          camera_id: data.camera_id,
          location: data.location,
          severity: data.severity,
          timestamp: data.timestamp
        });
        break;
        
      case 'camera_status':
        updateCameraStatus(data.camera_id, data.status);
        break;
        
      case 'incident':
        addIncident({
          id: data.incident_id,
          camera_id: data.camera_id,
          incident_type: data.incident_type,
          location: data.location,
          severity: data.severity,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp,
          status: 'active'
        });
        
        // Also create an alert for the incident
        addAlert({
          type: data.incident_type,
          message: `${data.incident_type} detected at ${data.location}`,
          camera_id: data.camera_id,
          location: data.location,
          severity: data.severity,
          timestamp: data.timestamp
        });
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const addAlert = (alertData) => {
    const newAlert = {
      id: Date.now() + Math.random(),
      timestamp: new Date(alertData.timestamp || new Date()),
      ...alertData
    };
    
    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep only last 50 alerts
    
    // Play alert sound
    playAlertSound();
    
    // Trigger browser notification if permission granted
    showBrowserNotification(newAlert);
  };

  const addIncident = (incidentData) => {
    setIncidents(prev => [incidentData, ...prev].slice(0, 100)); // Keep last 100 incidents
  };

  const updateCameraStatus = (cameraId, status) => {
    setCameraStatuses(prev => new Map(prev.set(cameraId, {
      status,
      timestamp: new Date(),
      previousStatus: prev.get(cameraId)?.status
    })));
  };

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const playAlertSound = () => {
    // Create audio context for alert sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not available');
    }
  };

  const showBrowserNotification = (alert) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Security Alert: ${alert.type}`, {
        body: alert.message,
        icon: '/favicon.svg',
        tag: alert.camera_id // Prevent duplicate notifications for same camera
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  const simulateAlert = (type = 'weapon_detected') => {
    const alertTypes = {
      weapon_detected: {
        type: 'Weapon Detected',
        message: 'Suspicious weapon detected at Camera CAM002 (Metro Station)',
        severity: 'high',
        camera_id: 'CAM002',
        location: 'Metro Station'
      },
      fire_detected: {
        type: 'Fire Detected',
        message: 'Fire detected at Camera CAM001 (City Center)',
        severity: 'critical',
        camera_id: 'CAM001',
        location: 'City Center'
      },
      suspicious_activity: {
        type: 'Suspicious Activity',
        message: 'Unusual behavior detected at Camera CAM003 (Airport Gate)',
        severity: 'medium',
        camera_id: 'CAM003',
        location: 'Airport Gate'
      }
    };

    addAlert(alertTypes[type] || alertTypes.weapon_detected);
  };

  const getCameraStatus = (cameraId) => {
    return cameraStatuses.get(cameraId);
  };

  const getRecentIncidents = (limit = 10) => {
    return incidents.slice(0, limit);
  };

  const value = {
    alerts,
    incidents,
    cameraStatuses,
    socket,
    addAlert,
    addIncident,
    removeAlert,
    clearAllAlerts,
    simulateAlert,
    getCameraStatus,
    getRecentIncidents,
    requestNotificationPermission,
    updateCameraStatus
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};