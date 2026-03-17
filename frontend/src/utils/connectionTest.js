/**
 * Connection Test Utility for Smart City Surveillance System
 * Tests backend connectivity and WebSocket connection
 */

export const testBackendConnection = async () => {
  const results = {
    api: false,
    websocket: false,
    health: false,
    errors: []
  };

  // Test API connection
  try {
    const response = await fetch('http://localhost:8000/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      results.api = true;
      console.log('✅ API connection successful');
    } else {
      results.errors.push(`API returned status: ${response.status}`);
    }
  } catch (error) {
    results.errors.push(`API connection failed: ${error.message}`);
    console.error('❌ API connection failed:', error);
  }

  // Test health endpoint
  try {
    const response = await fetch('http://localhost:8000/health');
    if (response.ok) {
      const data = await response.json();
      results.health = true;
      console.log('✅ Health check successful:', data);
    } else {
      results.errors.push(`Health check failed: ${response.status}`);
    }
  } catch (error) {
    results.errors.push(`Health check error: ${error.message}`);
    console.error('❌ Health check failed:', error);
  }

  // Test WebSocket connection
  return new Promise((resolve) => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws');
      
      const timeout = setTimeout(() => {
        results.errors.push('WebSocket connection timeout');
        ws.close();
        resolve(results);
      }, 5000);

      ws.onopen = () => {
        results.websocket = true;
        console.log('✅ WebSocket connection successful');
        clearTimeout(timeout);
        ws.close();
        resolve(results);
      };

      ws.onerror = (error) => {
        results.errors.push(`WebSocket error: ${error.message || 'Connection failed'}`);
        console.error('❌ WebSocket connection failed:', error);
        clearTimeout(timeout);
        resolve(results);
      };

      ws.onclose = (event) => {
        if (!results.websocket) {
          results.errors.push(`WebSocket closed: ${event.code} - ${event.reason}`);
        }
      };

    } catch (error) {
      results.errors.push(`WebSocket setup error: ${error.message}`);
      console.error('❌ WebSocket setup failed:', error);
      resolve(results);
    }
  });
};

export const displayConnectionStatus = (results) => {
  console.log('\n🔍 Connection Test Results:');
  console.log('=' * 40);
  console.log(`API Connection: ${results.api ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Health Check: ${results.health ? '✅ OK' : '❌ FAILED'}`);
  console.log(`WebSocket: ${results.websocket ? '✅ OK' : '❌ FAILED'}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (!results.api || !results.websocket) {
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Make sure backend server is running on port 8000');
    console.log('  2. Check if MongoDB is connected');
    console.log('  3. Verify no firewall is blocking the connection');
    console.log('  4. Try restarting both frontend and backend');
  }
};

// Auto-run connection test in development
if (import.meta.env.DEV) {
  testBackendConnection().then(displayConnectionStatus);
}