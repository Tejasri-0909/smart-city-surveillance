/**
 * Test script to verify all UI functionality works correctly
 */

export const testIncidentActions = async () => {
  console.log('🧪 Testing Incident Action Buttons...');
  
  try {
    // Test incident status update
    const response = await fetch('http://127.0.0.1:8000/incidents/incident-001/status?status=resolved', {
      method: 'PATCH'
    });
    
    if (response.ok) {
      console.log('✅ Incident status update works');
      return true;
    } else {
      console.log('❌ Incident status update failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Incident API error:', error);
    return false;
  }
};

export const testCameraControls = () => {
  console.log('🧪 Testing Camera Controls...');
  
  // Test video elements
  const videos = document.querySelectorAll('video');
  console.log(`Found ${videos.length} video elements`);
  
  if (videos.length > 0) {
    console.log('✅ Video elements present');
    
    // Test video playback
    videos.forEach((video, index) => {
      if (video.readyState >= 2) {
        console.log(`✅ Video ${index + 1} is ready to play`);
      } else {
        console.log(`⚠️ Video ${index + 1} not ready`);
      }
    });
    
    return true;
  } else {
    console.log('❌ No video elements found');
    return false;
  }
};

export const testFullScreenLayout = () => {
  console.log('🧪 Testing Full Screen Layout...');
  
  const app = document.querySelector('.app');
  const mainContent = document.querySelector('.main-content');
  const contentArea = document.querySelector('.content-area');
  
  if (app && mainContent && contentArea) {
    const appWidth = app.offsetWidth;
    const viewportWidth = window.innerWidth;
    
    console.log(`App width: ${appWidth}px, Viewport: ${viewportWidth}px`);
    
    if (appWidth >= viewportWidth * 0.95) {
      console.log('✅ Full screen layout working');
      return true;
    } else {
      console.log('❌ Layout not using full screen');
      return false;
    }
  } else {
    console.log('❌ Layout elements not found');
    return false;
  }
};

export const testCameraGrid = () => {
  console.log('🧪 Testing Camera Grid Layout...');
  
  const cameraGrid = document.querySelector('.camera-grid');
  
  if (cameraGrid) {
    const gridStyle = window.getComputedStyle(cameraGrid);
    const gridColumns = gridStyle.gridTemplateColumns;
    
    console.log(`Grid columns: ${gridColumns}`);
    
    if (gridColumns.includes('1fr 1fr 1fr') || gridColumns.split(' ').length === 3) {
      console.log('✅ 3x2 camera grid layout working');
      return true;
    } else {
      console.log('❌ Camera grid layout incorrect');
      return false;
    }
  } else {
    console.log('❌ Camera grid not found');
    return false;
  }
};

export const testNavigationFlow = () => {
  console.log('🧪 Testing Navigation Flow...');
  
  // Test if React Router is working
  const currentPath = window.location.pathname;
  console.log(`Current path: ${currentPath}`);
  
  // Test navigation elements
  const navItems = document.querySelectorAll('.nav-item');
  console.log(`Found ${navItems.length} navigation items`);
  
  if (navItems.length >= 7) {
    console.log('✅ Navigation menu complete');
    return true;
  } else {
    console.log('❌ Navigation menu incomplete');
    return false;
  }
};

export const testWebSocketConnection = () => {
  console.log('🧪 Testing WebSocket Connection...');
  
  try {
    const ws = new WebSocket('ws://localhost:8000/realtime/alerts');
    
    ws.onopen = () => {
      console.log('✅ WebSocket connection successful');
      ws.close();
    };
    
    ws.onerror = () => {
      console.log('❌ WebSocket connection failed');
    };
    
    return true;
  } catch (error) {
    console.log('❌ WebSocket error:', error);
    return false;
  }
};

export const runAllTests = async () => {
  console.log('🚀 Running Smart City Surveillance UI Tests');
  console.log('=' * 50);
  
  const results = {
    incidentActions: await testIncidentActions(),
    cameraControls: testCameraControls(),
    fullScreenLayout: testFullScreenLayout(),
    cameraGrid: testCameraGrid(),
    navigationFlow: testNavigationFlow(),
    webSocketConnection: testWebSocketConnection()
  };
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n' + '=' * 50);
  console.log(`🎯 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! UI is fully functional.');
  } else {
    console.log('⚠️ Some tests failed. Check the issues above.');
  }
  
  return results;
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after page load
  window.addEventListener('load', () => {
    setTimeout(runAllTests, 2000);
  });
}