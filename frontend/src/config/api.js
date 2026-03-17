// API Configuration for Smart City Surveillance

// Production URLs (Render deployment) - Primary
const PRODUCTION_CONFIG = {
  API_BASE_URL: 'https://smart-city-surveillance.onrender.com',
  WS_BASE_URL: 'wss://smart-city-surveillance.onrender.com'
};

// Fallback configuration when Render is down
const FALLBACK_CONFIG = {
  API_BASE_URL: 'fallback', // Special flag for fallback mode
  WS_BASE_URL: 'fallback'
};

// Start with production, will switch to fallback if needed
export let API_CONFIG = PRODUCTION_CONFIG;

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

// Log current configuration
console.log('🔧 API Configuration (PRODUCTION WITH FALLBACK):', {
  environment: 'production-with-fallback',
  apiUrl: API_CONFIG.API_BASE_URL,
  wsUrl: API_CONFIG.WS_BASE_URL
});