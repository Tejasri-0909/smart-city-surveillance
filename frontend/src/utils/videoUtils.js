/**
 * Enhanced Video utilities for Smart City Surveillance System
 * Handles video loading, fallbacks, and realistic canvas-based simulation
 */

// Sample video URLs from public sources
export const SAMPLE_VIDEO_URLS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
];

// Enhanced location-specific simulation configurations
const LOCATION_CONFIGS = {
  'CAM001': { // City Center
    name: 'City Center',
    bgColor: '#1a1a2e',
    elements: [
      { type: 'building', x: 50, y: 80, width: 80, height: 140, color: '#444' },
      { type: 'building', x: 150, y: 60, width: 60, height: 160, color: '#555' },
      { type: 'building', x: 250, y: 90, width: 70, height: 130, color: '#333' },
      { type: 'road', x: 0, y: 250, width: 640, height: 50, color: '#222' },
      { type: 'sidewalk', x: 0, y: 240, width: 640, height: 10, color: '#666' },
      { type: 'pedestrian', speed: 0.8, color: '#00ff88' },
      { type: 'car', speed: 1.5, color: '#ffaa00' },
      { type: 'traffic_light', x: 320, y: 200, color: '#ff4444' }
    ]
  },
  'CAM002': { // Metro Station
    name: 'Metro Station',
    bgColor: '#0f1419',
    elements: [
      { type: 'platform', x: 0, y: 180, width: 640, height: 80, color: '#555' },
      { type: 'tracks', x: 0, y: 260, width: 640, height: 30, color: '#333' },
      { type: 'ceiling', x: 0, y: 0, width: 640, height: 60, color: '#222' },
      { type: 'pillar', x: 160, y: 60, width: 20, height: 120, color: '#444' },
      { type: 'pillar', x: 460, y: 60, width: 20, height: 120, color: '#444' },
      { type: 'train', speed: 2.5, color: '#0088ff' },
      { type: 'passenger', speed: 0.4, color: '#00ff88' }
    ]
  },
  'CAM003': { // Airport Gate
    name: 'Airport Gate',
    bgColor: '#1a1a2e',
    elements: [
      { type: 'terminal', x: 100, y: 80, width: 440, height: 180, color: '#555' },
      { type: 'jetbridge', x: 540, y: 140, width: 100, height: 80, color: '#666' },
      { type: 'aircraft', x: 580, y: 100, width: 60, height: 160, color: '#ffffff' },
      { type: 'window', x: 120, y: 100, width: 60, height: 40, color: '#87ceeb' },
      { type: 'window', x: 200, y: 100, width: 60, height: 40, color: '#87ceeb' },
      { type: 'passenger', speed: 0.3, color: '#00ff88' },
      { type: 'luggage_cart', speed: 0.6, color: '#ffaa00' }
    ]
  },
  'CAM004': { // Shopping Mall
    name: 'Shopping Mall',
    bgColor: '#1a1a2e',
    elements: [
      { type: 'store', x: 30, y: 40, width: 140, height: 120, color: '#555' },
      { type: 'store', x: 200, y: 40, width: 140, height: 120, color: '#444' },
      { type: 'store', x: 370, y: 40, width: 140, height: 120, color: '#555' },
      { type: 'corridor', x: 0, y: 200, width: 640, height: 100, color: '#666' },
      { type: 'fountain', x: 320, y: 230, width: 40, height: 40, color: '#87ceeb' },
      { type: 'shopper', speed: 0.4, color: '#00ff88' },
      { type: 'security', speed: 0.2, color: '#ffaa00' }
    ]
  },
  'CAM005': { // Park Entrance
    name: 'Park Entrance',
    bgColor: '#0d1b0d',
    elements: [
      { type: 'tree', x: 80, y: 60, width: 50, height: 100, color: '#228B22' },
      { type: 'tree', x: 200, y: 40, width: 60, height: 120, color: '#32CD32' },
      { type: 'tree', x: 400, y: 70, width: 45, height: 90, color: '#228B22' },
      { type: 'path', x: 0, y: 200, width: 640, height: 40, color: '#8B4513' },
      { type: 'grass', x: 0, y: 240, width: 640, height: 120, color: '#006400' },
      { type: 'bench', x: 150, y: 180, width: 60, height: 20, color: '#8B4513' },
      { type: 'visitor', speed: 0.5, color: '#00ff88' },
      { type: 'jogger', speed: 1.2, color: '#ffaa00' }
    ]
  },
  'CAM006': { // Highway Bridge
    name: 'Highway Bridge',
    bgColor: '#1a1a2e',
    elements: [
      { type: 'bridge_deck', x: 0, y: 140, width: 640, height: 120, color: '#666' },
      { type: 'railing', x: 0, y: 130, width: 640, height: 10, color: '#888' },
      { type: 'railing', x: 0, y: 260, width: 640, height: 10, color: '#888' },
      { type: 'lane_marking', x: 0, y: 195, width: 640, height: 5, color: '#ffff00' },
      { type: 'support', x: 200, y: 260, width: 15, height: 100, color: '#555' },
      { type: 'support', x: 425, y: 260, width: 15, height: 100, color: '#555' },
      { type: 'vehicle', speed: 3.0, color: '#ffaa00' },
      { type: 'truck', speed: 2.2, color: '#ff4444' }
    ]
  }
};

// Create a realistic location-specific canvas simulation with enhanced graphics
export const createSimulatedVideo = (canvas, cameraId) => {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  const config = LOCATION_CONFIGS[cameraId] || LOCATION_CONFIGS['CAM001'];
  let animationId;
  let startTime = Date.now();
  
  // Moving objects state
  const movingObjects = [];
  
  // Initialize moving objects with more variety
  config.elements.forEach(element => {
    if (element.speed) {
      for (let i = 0; i < (element.type === 'pedestrian' ? 3 : 2); i++) {
        movingObjects.push({
          ...element,
          x: Math.random() * width,
          y: height * (0.6 + Math.random() * 0.3),
          direction: Math.random() > 0.5 ? 1 : -1,
          size: 15 + Math.random() * 10,
          speed: element.speed * (0.8 + Math.random() * 0.4), // Vary speed
          phase: Math.random() * Math.PI * 2 // For animation variation
        });
      }
    }
  });
  
  // Enhanced gradient backgrounds
  const createGradientBackground = () => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    switch (cameraId) {
      case 'CAM001': // City Center
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.3, '#16213e');
        gradient.addColorStop(1, '#0f1419');
        break;
      case 'CAM002': // Metro Station
        gradient.addColorStop(0, '#0f1419');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        break;
      case 'CAM003': // Airport
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.4, '#2a2a4e');
        gradient.addColorStop(1, '#1a1a2e');
        break;
      case 'CAM004': // Shopping Mall
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.6, '#2a2040');
        gradient.addColorStop(1, '#1a1a2e');
        break;
      case 'CAM005': // Park
        gradient.addColorStop(0, '#0d1b0d');
        gradient.addColorStop(0.4, '#1a2e1a');
        gradient.addColorStop(1, '#0d1b0d');
        break;
      case 'CAM006': // Highway
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#2a2a4e');
        gradient.addColorStop(1, '#1a1a2e');
        break;
      default:
        gradient.addColorStop(0, config.bgColor);
        gradient.addColorStop(1, config.bgColor);
    }
    
    return gradient;
  };
  
  const animate = () => {
    // Clear canvas with enhanced gradient background
    ctx.fillStyle = createGradientBackground();
    ctx.fillRect(0, 0, width, height);
    
    const time = (Date.now() - startTime) * 0.001;
    
    // Add atmospheric effects
    ctx.save();
    ctx.globalAlpha = 0.1 + 0.05 * Math.sin(time * 0.5);
    ctx.fillStyle = '#ffffff';
    
    // Subtle lighting effects
    for (let i = 0; i < 20; i++) {
      const x = (width * i / 20) + 10 * Math.sin(time + i);
      const y = height * 0.1 + 5 * Math.cos(time * 0.7 + i);
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    
    // Draw static elements with enhanced graphics
    config.elements.forEach(element => {
      if (!element.speed) { // Static elements
        ctx.fillStyle = element.color;
        
        if (element.type === 'building' || element.type === 'store') {
          // Enhanced building with depth and lighting
          ctx.fillRect(element.x, element.y, element.width, element.height);
          
          // Add building depth/shadow
          ctx.fillStyle = '#000000';
          ctx.globalAlpha = 0.3;
          ctx.fillRect(element.x + element.width, element.y + 5, 8, element.height - 5);
          ctx.globalAlpha = 1;
          
          // Enhanced windows with realistic lighting
          const windowsPerRow = Math.floor(element.width / 25);
          const windowRows = Math.floor(element.height / 30);
          
          for (let i = 0; i < windowsPerRow; i++) {
            for (let j = 0; j < windowRows; j++) {
              const windowX = element.x + 8 + i * 25;
              const windowY = element.y + 15 + j * 30;
              
              // Random window lighting (some on, some off)
              const isLit = Math.sin(time * 0.1 + i + j) > -0.3;
              
              if (isLit) {
                ctx.fillStyle = '#ffff88';
                ctx.globalAlpha = 0.8 + 0.2 * Math.sin(time * 2 + i + j);
              } else {
                ctx.fillStyle = '#333366';
                ctx.globalAlpha = 0.5;
              }
              
              ctx.fillRect(windowX, windowY, 12, 8);
              
              // Window frame
              ctx.globalAlpha = 1;
              ctx.strokeStyle = '#666666';
              ctx.lineWidth = 1;
              ctx.strokeRect(windowX, windowY, 12, 8);
            }
          }
          ctx.globalAlpha = 1;
          
        } else if (element.type === 'tree') {
          // Enhanced tree with swaying animation
          const sway = 3 * Math.sin(time * 0.5 + element.x * 0.01);
          
          // Tree trunk
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(element.x + element.width/2 - 3 + sway/2, element.y + element.height - 20, 6, 20);
          
          // Tree canopy with multiple layers
          ctx.fillStyle = element.color;
          ctx.beginPath();
          ctx.arc(element.x + element.width/2 + sway, element.y + element.height/2, element.width/2, 0, Math.PI * 2);
          ctx.fill();
          
          // Lighter canopy layer
          ctx.fillStyle = '#32CD32';
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.arc(element.x + element.width/2 + sway - 5, element.y + element.height/2 - 5, element.width/3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          
        } else {
          // Enhanced other static elements
          ctx.fillRect(element.x, element.y, element.width, element.height);
          
          // Add subtle highlights
          if (element.type === 'road' || element.type === 'platform') {
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.1;
            ctx.fillRect(element.x, element.y, element.width, 2);
            ctx.globalAlpha = 1;
          }
        }
      }
    });
    
    // Draw and animate moving objects with enhanced graphics
    movingObjects.forEach((obj, index) => {
      ctx.fillStyle = obj.color;
      
      // Update position with more natural movement
      const baseSpeed = obj.speed * obj.direction * 0.5;
      const wobble = 0.5 * Math.sin(time * 2 + obj.phase);
      obj.x += baseSpeed + wobble * 0.1;
      
      // Wrap around screen
      if (obj.x > width + obj.size) {
        obj.x = -obj.size;
        obj.y = height * (0.6 + Math.random() * 0.3); // Vary Y position
      } else if (obj.x < -obj.size) {
        obj.x = width + obj.size;
        obj.y = height * (0.6 + Math.random() * 0.3);
      }
      
      // Enhanced object rendering
      if (obj.type === 'pedestrian' || obj.type === 'passenger' || 
          obj.type === 'shopper' || obj.type === 'visitor' || 
          obj.type === 'security' || obj.type === 'jogger') {
        
        // Enhanced person with walking animation
        const walkCycle = Math.sin(time * 4 + obj.phase) * 2;
        
        // Body
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y + walkCycle, 8, 20);
        
        // Head
        ctx.fillStyle = '#ffddaa';
        ctx.beginPath();
        ctx.arc(obj.x + 4, obj.y - 2 + walkCycle, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Arms (swinging)
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obj.x + 2, obj.y + 5 + walkCycle);
        ctx.lineTo(obj.x + 2 + Math.sin(time * 4 + obj.phase) * 3, obj.y + 12 + walkCycle);
        ctx.moveTo(obj.x + 6, obj.y + 5 + walkCycle);
        ctx.lineTo(obj.x + 6 - Math.sin(time * 4 + obj.phase) * 3, obj.y + 12 + walkCycle);
        ctx.stroke();
        
      } else if (obj.type === 'car' || obj.type === 'vehicle') {
        // Enhanced car with headlights and details
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, 40, 18);
        
        // Car windows
        ctx.fillStyle = '#87ceeb';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(obj.x + 8, obj.y + 2, 24, 6);
        ctx.globalAlpha = 1;
        
        // Headlights
        ctx.fillStyle = '#ffffff';
        if (obj.direction > 0) {
          ctx.fillRect(obj.x + 38, obj.y + 4, 3, 4);
          ctx.fillRect(obj.x + 38, obj.y + 10, 3, 4);
        } else {
          ctx.fillRect(obj.x - 1, obj.y + 4, 3, 4);
          ctx.fillRect(obj.x - 1, obj.y + 10, 3, 4);
        }
        
        // Wheels with rotation
        ctx.fillStyle = '#333';
        const wheelRotation = (time * obj.speed * 2) % (Math.PI * 2);
        ctx.save();
        ctx.translate(obj.x + 8, obj.y + 18);
        ctx.rotate(wheelRotation);
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
        
        ctx.save();
        ctx.translate(obj.x + 32, obj.y + 18);
        ctx.rotate(wheelRotation);
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
        
      } else if (obj.type === 'truck') {
        // Enhanced truck
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, 60, 25);
        
        // Truck cab
        ctx.fillStyle = '#555555';
        ctx.fillRect(obj.x + (obj.direction > 0 ? 40 : 0), obj.y - 5, 20, 20);
        
        // Wheels
        ctx.fillStyle = '#333';
        ctx.fillRect(obj.x + 8, obj.y + 22, 10, 6);
        ctx.fillRect(obj.x + 42, obj.y + 22, 10, 6);
        
      } else if (obj.type === 'train') {
        // Enhanced train with more detail
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, 120, 30);
        
        // Train cars separation
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(obj.x + i * 30, obj.y);
          ctx.lineTo(obj.x + i * 30, obj.y + 30);
          ctx.stroke();
        }
        
        // Windows with lighting
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 4; i++) {
          const windowX = obj.x + 5 + i * 30;
          ctx.globalAlpha = 0.8 + 0.2 * Math.sin(time + i);
          ctx.fillRect(windowX, obj.y + 8, 20, 10);
        }
        ctx.globalAlpha = 1;
        
      } else {
        // Default enhanced moving object
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
      }
    });
    
    // Enhanced AI detection overlay with realistic scanning
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    
    // Multiple scanning patterns
    for (let i = 0; i < 2; i++) {
      const scanRadius = 25 + Math.sin(time * 1.5 + i * Math.PI) * 10;
      const scanX = width * (0.2 + 0.6 * Math.sin(time * 0.3 + i));
      const scanY = height * (0.3 + 0.4 * Math.cos(time * 0.4 + i));
      
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(scanX, scanY, scanRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Scanning beam
      ctx.beginPath();
      ctx.moveTo(scanX, scanY);
      ctx.lineTo(scanX + scanRadius * Math.cos(time * 2 + i), scanY + scanRadius * Math.sin(time * 2 + i));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // Enhanced detection boxes with realistic AI behavior
    movingObjects.forEach((obj, index) => {
      const detectionChance = Math.sin(time * 0.5 + obj.x * 0.01 + index) > 0.7;
      
      if (detectionChance) {
        // Detection confidence animation
        const confidence = 0.7 + 0.3 * Math.sin(time * 3 + index);
        const boxColor = confidence > 0.85 ? '#ff4444' : '#ffaa00';
        
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = confidence;
        
        // Detection box with padding
        const padding = 8;
        ctx.strokeRect(obj.x - padding, obj.y - padding, obj.size + padding * 2, obj.size + padding * 2);
        
        // Detection label with confidence
        ctx.fillStyle = boxColor;
        ctx.font = 'bold 10px monospace';
        const label = `${obj.type.toUpperCase()} ${Math.floor(confidence * 100)}%`;
        ctx.fillText(label, obj.x - padding, obj.y - padding - 5);
        
        // Tracking line to center
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(obj.x + obj.size/2, obj.y + obj.size/2);
        ctx.lineTo(width/2, height/2);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1;
    
    // Enhanced scan lines with depth
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < height; i += 4) {
      const offset = Math.floor(time * 20) % 8;
      if ((i + offset) % 8 < 3) {
        ctx.globalAlpha = 0.1 + 0.05 * Math.sin(time * 2 + i * 0.1);
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    
    // Enhanced camera info overlay with professional styling
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(cameraId, 15, 30);
    
    ctx.font = '12px monospace';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(config.name, 15, 50);
    
    // Enhanced timestamp with milliseconds
    const now = new Date();
    const timestamp = `${now.toLocaleTimeString()}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    ctx.fillText(timestamp, 15, height - 15);
    
    // Enhanced status indicators
    ctx.fillStyle = '#ffaa00'; // Simulation indicator
    ctx.beginPath();
    ctx.arc(width - 30, 30, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('SIM', width - 55, 35);
    
    // Enhanced recording indicator with pulsing
    const recordingPulse = Math.sin(time * 6) > 0;
    if (recordingPulse) {
      ctx.fillStyle = '#ff4444';
      ctx.globalAlpha = 0.8 + 0.2 * Math.sin(time * 8);
      ctx.beginPath();
      ctx.arc(width - 30, 55, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('REC', width - 50, 60);
    }
    ctx.globalAlpha = 1;
    
    // Frame rate indicator
    ctx.fillStyle = '#888888';
    ctx.font = '9px monospace';
    ctx.fillText('30 FPS', width - 50, height - 15);
    
    // Resolution indicator
    ctx.fillText('1080p', width - 50, height - 5);
    
    animationId = requestAnimationFrame(animate);
  };
  
  animate();
  
  // Return cleanup function
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};

export default { SAMPLE_VIDEO_URLS, createSimulatedVideo };