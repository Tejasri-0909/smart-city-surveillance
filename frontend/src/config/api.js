// API Configuration for Smart City Surveillance with Real-time Support

// Production URLs (Render deployment) - Primary
const PRODUCTION_CONFIG = {
  API_BASE_URL: 'https://smart-city-surveillance.onrender.com',
  WS_BASE_URL: 'wss://smart-city-surveillance.onrender.com'
};

// Local development URLs
const DEVELOPMENT_CONFIG = {
  API_BASE_URL: 'http://localhost:8001',
  WS_BASE_URL: 'ws://localhost:8001'
};

// Fallback configuration when backend is down
const FALLBACK_CONFIG = {
  API_BASE_URL: 'fallback', // Special flag for fallback mode
  WS_BASE_URL: 'fallback'
};

// Auto-detect environment and start with appropriate config
export let API_CONFIG = window.location.hostname === 'localhost' 
  ? DEVELOPMENT_CONFIG 
  : PRODUCTION_CONFIG;

// Helper functions with fallback support
export const getApiUrl = (endpoint) => {
  if (API_CONFIG.API_BASE_URL === 'fallback') {
    return 'fallback'; // Signal to use local data
  }
  return `${API_CONFIG.API_BASE_URL}${endpoint}`;
};

export const getWsUrl = (endpoint) => {
  if (API_CONFIG.WS_BASE_URL === 'fallback') {
    return null; // No WebSocket in fallback mode
  }
  return `${API_CONFIG.WS_BASE_URL}${endpoint}`;
};

// Function to switch to fallback mode
export const switchToFallbackMode = () => {
  API_CONFIG = FALLBACK_CONFIG;
  console.log('🔄 Switched to fallback mode - using local data');
};

// Function to check if in fallback mode
export const isFallbackMode = () => API_CONFIG.API_BASE_URL === 'fallback';

// Real-time API helpers
export const makeApiCall = async (endpoint, options = {}) => {
  try {
    const url = getApiUrl(endpoint);
    if (url === 'fallback') {
      throw new Error('Backend unavailable - fallback mode');
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
};

// WebSocket connection helper
export const createWebSocketConnection = (endpoint, onMessage, onError) => {
  const wsUrl = getWsUrl(endpoint);
  if (!wsUrl) {
    console.log('📱 WebSocket not available in fallback mode');
    return null;
  }

  try {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connected to:', wsUrl);
    };
    
    ws.onmessage = onMessage;
    ws.onerror = onError;
    
    ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
    };
    
    return ws;
  } catch (error) {
    console.error('❌ WebSocket connection failed:', error);
    if (onError) onError(error);
    return null;
  }
};

// Log current configuration
console.log('🔧 API Configuration (REAL-TIME ENABLED):', {
  environment: window.location.hostname === 'localhost' ? 'development' : 'production',
  apiUrl: API_CONFIG.API_BASE_URL,
  wsUrl: API_CONFIG.WS_BASE_URL,
  realTimeEnabled: true
});