import { createContext, useContext, useState, useEffect } from 'react';
import { generateAlert, generateIncidents } from '../utils/sampleData';
import axios from 'axios';

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
  const [incidents, setIncidents] = useState([]);
  const [websocket, setWebsocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Alarm sound setup
  const alarmSound = new Audio("/alarm.mp3");
  
  const playAlarm = () => {
    alarmSound.currentTime = 0;
    alarmSound.play().catch((error) => {
      console.warn('Could not play alarm sound:', error);
    });
  };

  // Fetch incidents from backend
  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/incidents?limit=10');
      const incidentData = response.data.incidents || [];
      
      // Process backend data and limit to 10 most recent incidents
      const processedIncidents = incidentData.slice(0, 10).map(incident => {
        const incidentId = incident.id || incident._id;
        
        return {
          ...incident,
          id: incidentId,
          status: incident.status || 'active',
          severity: incident.severity || 'medium',
          timestamp: incident.timestamp || incident.created_at || new Date().toISOString(),
          latitude: incident.latitude || 40.7128,
          longitude: incident.longitude || -74.006,
          camera_id: incident.camera_id || 'CAM001',
          incident_type: incident.incident_type || 'Unknown',
          location: incident.location || 'Unknown Location'
        };
      });
      
      setIncidents(processedIncidents);
      console.log('✅ Incidents fetched and limited to:', processedIncidents.length);
      
      // Log breakdown for debugging
      const breakdown = {
        total: processedIncidents.length,
        active: processedIncidents.filter(i => i.status === 'active').length,
        resolved: processedIncidents.filter(i => i.status === 'resolved').length,
        falseAlarm: processedIncidents.filter(i => i.status === 'false-alarm').length,
      };
      
      console.log('📊 Incident breakdown:', breakdown);
      
    } catch (error) {
      console.error('❌ Failed to fetch incidents:', error);
      
      // Use minimal fallback data
      const sampleIncidents = [
        {
          id: 'fallback-1',
          camera_id: "CAM002",
          location: "Metro Station",
          latitude: 40.7589,
          longitude: -73.9851,
          incident_type: "Suspicious Activity",
          severity: "medium",
          status: "active",
          timestamp: new Date().toISOString(),
        },
        {
          id: 'fallback-2',
          camera_id: "CAM004",
          location: "Shopping Mall",
          latitude: 40.7505,
          longitude: -73.9934,
          incident_type: "Weapon Detected",
          severity: "critical",
          status: "active",
          timestamp: new Date().toISOString(),
        },
        {
          id: 'fallback-3',
          camera_id: "CAM001",
          location: "City Center",
          latitude: 40.7128,
          longitude: -74.006,
          incident_type: "Fire Detected",
          severity: "high",
          status: "resolved",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        }
      ];
      setIncidents(sampleIncidents);
      console.log('⚠️ Using fallback sample data:', sampleIncidents.length, 'incidents');
    }
  };

  // Initial data fetch and connection setup
  useEffect(() => {
    fetchIncidents();
    
    // If incidents fetch successfully, consider the system connected
    // even if WebSocket fails (fallback for API-only mode)
    const checkConnection = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/incidents?limit=1');
        if (response.status === 200) {
          // If WebSocket is not connected but API works, show as connected
          if (connectionStatus === 'connecting' || connectionStatus === 'error') {
            console.log('📡 API working, using fallback connection mode');
            setConnectionStatus('connected');
          }
        }
      } catch (error) {
        console.log('API check failed:', error.message);
      }
    };
    
    // Check connection after 3 seconds if still connecting
    const connectionCheck = setTimeout(checkConnection, 3000);
    
    // Refresh incidents every 30 seconds
    const interval = setInterval(fetchIncidents, 30000);
    
    return () => {
      clearTimeout(connectionCheck);
      clearInterval(interval);
    };
  }, [connectionStatus]);

  // Test backend connectivity
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        console.log('✅ Backend is running and healthy');
        return true;
      } else {
        console.error('❌ Backend health check failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return false;
    }
  };

  // Improved WebSocket connection for 24/7 operation
  useEffect(() => {
    let reconnectTimer;
    let connectionTimeout;
    let heartbeatInterval;
    
    const connectWebSocket = async () => {
      // First test if backend is running
      const backendHealthy = await testBackendConnection();
      if (!backendHealthy) {
        console.error('Backend not available, retrying in 5 seconds...');
        setConnectionStatus('error');
        reconnectTimer = setTimeout(connectWebSocket, 5000);
        return;
      }

      try {
        setConnectionStatus('connecting');
        const ws = new WebSocket('ws://localhost:8000/ws');
        
        // Set connection timeout
        connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            console.log('⏰ WebSocket connection timeout, closing...');
            ws.close();
            setConnectionStatus('error');
          }
        }, 10000); // 10 second timeout
        
        ws.onopen = () => {
          console.log('✅ WebSocket connected successfully (24/7 mode)');
          clearTimeout(connectionTimeout);
          setConnectionStatus('connected');
          setWebsocket(ws);
          setConnectionAttempts(0);
          
          // Start heartbeat to keep connection alive
          heartbeatInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ 
                type: 'heartbeat', 
                timestamp: Date.now() 
              }));
            }
          }, 30000); // Send heartbeat every 30 seconds
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'connection') {
              console.log('🔗 WebSocket connection confirmed:', data.message);
            } else if (data.type === 'heartbeat' || data.type === 'heartbeat_ack') {
              console.log('💓 Heartbeat received - connection alive');
            } else if (data.type === 'pong') {
              console.log('🏓 Pong received');
            } else if (data.type === 'alert') {
              // Real-time alert from AI detection
              const alertData = data.data;
              setAlerts(prev => [alertData, ...prev].slice(0, 50));
              playAlarm();
              
              // Also add to incidents if it's a new incident
              if (alertData.incident_type) {
                const incident = {
                  id: alertData.id || Date.now(),
                  camera_id: alertData.camera_id,
                  incident_type: alertData.incident_type,
                  location: alertData.location,
                  latitude: alertData.latitude,
                  longitude: alertData.longitude,
                  severity: alertData.severity || 'medium',
                  status: 'active',
                  timestamp: alertData.timestamp
                };
                setIncidents(prev => [incident, ...prev].slice(0, 10));
                
                // Refresh incidents from backend
                setTimeout(fetchIncidents, 1000);
              }
            } else if (data.type === 'incident_update') {
              // Incident status update
              const updatedIncident = data.data;
              setIncidents(prev => 
                prev.map(incident => 
                  incident.id === updatedIncident.id ? updatedIncident : incident
                )
              );
              
              // Refresh incidents from backend
              setTimeout(fetchIncidents, 1000);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onclose = (event) => {
          console.log(`🔌 WebSocket disconnected: ${event.code} - ${event.reason}`);
          clearTimeout(connectionTimeout);
          clearInterval(heartbeatInterval);
          setConnectionStatus('disconnected');
          setWebsocket(null);
          
          // Only reconnect if it wasn't a manual close
          if (event.code !== 1000 && connectionAttempts < 10) {
            const attempts = connectionAttempts + 1;
            setConnectionAttempts(attempts);
            const delay = Math.min(3000 * attempts, 30000); // Max 30 seconds
            
            console.log(`🔄 Reconnecting in ${delay/1000} seconds... (attempt ${attempts})`);
            reconnectTimer = setTimeout(connectWebSocket, delay);
          }
        };
        
        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          clearTimeout(connectionTimeout);
          clearInterval(heartbeatInterval);
          setConnectionStatus('error');
        };
        
      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        setConnectionStatus('error');
        
        // Retry connection after delay
        const attempts = connectionAttempts + 1;
        setConnectionAttempts(attempts);
        const delay = Math.min(5000 * attempts, 30000);
        reconnectTimer = setTimeout(connectWebSocket, delay);
      }
    };

    // Start connection after a short delay
    const initialDelay = setTimeout(connectWebSocket, 2000);

    // Cleanup on unmount
    return () => {
      clearTimeout(initialDelay);
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
      }
      if (websocket) {
        websocket.close(1000, 'Component unmounting');
      }
    };
  }, []);

  const addAlert = (alertData) => {
    const newAlert = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString(),
      ...alertData
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 50));
    playAlarm();
  };

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const simulateAlert = () => {
    const alert = generateAlert();
    setAlerts(prev => [alert, ...prev]);
    playAlarm();
  };

  // Add function to update incident status
  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      // Update local state immediately for better UX
      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, status: newStatus }
            : incident
        )
      );

      console.log(`🔄 Updating incident ${incidentId} status to ${newStatus}`);

      // Send update to backend via WebSocket or API
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'incident_status_update',
          incident_id: incidentId,
          status: newStatus
        }));
      }

      // Make API call to ensure persistence - handle both custom ID and MongoDB ObjectId
      const response = await fetch(`http://localhost:8000/incidents/${incidentId}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to update incident status: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }

      console.log(`✅ Incident ${incidentId} status updated to ${newStatus}`);
      
      // Refresh incidents from backend to ensure all components are in sync
      setTimeout(fetchIncidents, 500);
    } catch (error) {
      console.error('❌ Error updating incident status:', error);
      // Revert the optimistic update on error
      fetchIncidents(); // Refresh from backend to get correct state
    }
  };

  // Function to refresh incidents (can be called by components)
  const refreshIncidents = () => {
    fetchIncidents();
  };

  const value = {
    alerts,
    incidents,
    connectionStatus,
    connectionAttempts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    simulateAlert,
    updateIncidentStatus,
    refreshIncidents
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};