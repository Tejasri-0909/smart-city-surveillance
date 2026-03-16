import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

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

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/realtime/alerts');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const alertData = JSON.parse(event.data);
        addAlert(alertData);
      } catch (error) {
        console.error('Error parsing alert data:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
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

  const addAlert = (alertData) => {
    const newAlert = {
      id: Date.now(),
      timestamp: new Date(),
      ...alertData
    };
    
    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep only last 50 alerts
    
    // Play alert sound
    playAlertSound();
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

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    simulateAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};