// API Configuration for Smart City Surveillance

// Production URLs (Render deployment) - ALWAYS USE THESE
const PRODUCTION_CONFIG = {
  API_BASE_URL: 'https://smart-city-surveillance.onrender.com',
  WS_BASE_URL: 'wss://smart-city-surveillance.onrender.com'
};

// Development URLs (local development)
const DEVELOPMENT_CONFIG = {
  API_BASE_URL: 'https://smart-city-surveillance.onrender.com', // Use production even in dev
  WS_BASE_URL: 'wss://smart-city-surveillance.onrender.com'     // Use production even in dev
};

// Force production URLs for permanent fix
export const API_CONFIG = PRODUCTION_CONFIG;

// Helper functions
export const getApiUrl = (endpoint) => `${API_CONFIG.API_BASE_URL}${endpoint}`;
export const getWsUrl = (endpoint) => `${API_CONFIG.WS_BASE_URL}${endpoint}`;

// Log current configuration
console.log('🔧 API Configuration (PERMANENT PRODUCTION):', {
  environment: 'production-forced',
  apiUrl: API_CONFIG.API_BASE_URL,
  wsUrl: API_CONFIG.WS_BASE_URL
});