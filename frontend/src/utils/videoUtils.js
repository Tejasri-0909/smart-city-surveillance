/**
 * Video utilities for Smart City Surveillance System
 * Handles video loading, fallbacks, and canvas-based simulation
 */

// Sample video URLs from public sources
export const SAMPLE_VIDEO_URLS = [
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', 
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

// Location-specific simulation configurations
const LOCATION_CONFIGS = {
  'CAM001': { // City Center
    name: 'City Center',
    bgColor: '#2a2a3e',
    elements: [
      { type: 'building', x: 50, y: 100, width: 80, height: 120, color: '#444' },
      { type: 'building', x: 150, y: 80, width: 60, height: 140, color: '#555' },
      { type: 'road', x: 0, y: 250, width: 640, height: 40, color: '#333' },
      { type: 'pedestrian', speed: 0.5, color: '#00ff88' },
      { type: 'car', speed: 1.2, color: '#ffaa00' }
    ]
  },
  'CAM002': { // Metro Station
    name: 'Metro Station',
    bgColor: '#1a1a2e',
    elements: [
      { type: 'platform', x: 0, y: 200, width: 640, height: 60, color: '#666' },
      { type: 'tracks', x: 0, y: 260, width: 640, height: 20, color: '#333' },
      { type: 'train', speed: 2.0, color: '#0088ff' },
      { type: 'passenger', speed: 0.3, color: '#00ff88' }
    ]
  },
  'CAM003': { // Airport Gate
    name: 'Airport Gate',
    bgColor: '#2a2a3e',
    elements: [
      { type: 'gate', x: 200, y: 100, width: 240, height: 160, color: '#555' },
      { type: 'jetbridge', x: 440, y: 150, width: 100, height: 60, color: '#666' },
      { type: 'aircraft', x: 540, y: 120, width: 80, height: 120, color: '#ffffff' },
      { type: 'passenger', speed: 0.4, color: '#00ff88' }
    ]
  },
  'CAM004': { // Shopping Mall
    name: 'Shopping Mall',
    bgColor: '#2a2a3e',
    elements: [
      { type: 'store', x: 50, y: 50, width: 120, height: 100, color: '#555' },
      { type: 'store', x: 200, y: 50, width: 120, height: 100, color: '#444' },
      { type: 'corridor', x: 0, y: 200, width: 640, height: 80, color: '#666' },
      { type: 'shopper', speed: 0.3, color: '#00ff88' }
    ]
  },
  'CAM005': { // Park Entrance
    name: 'Park Entrance',
    bgColor: '#1a2e1a',
    elements: [
      { type: 'tree', x: 100, y: 80, width: 40, height: 80, color: '#228B22' },
      { type: 'tree', x: 300, y: 60, width: 50, height: 100, color: '#32CD32' },
      { type: 'path', x: 0, y: 200, width: 640, height: 30, color: '#8B4513' },
      { type: 'visitor', speed: 0.4, color: '#00ff88' }
    ]
  },
  'CAM006': { // Highway Bridge
    name: 'Highway Bridge',
    bgColor: '#2a2a3e',
    elements: [
      { type: 'bridge', x: 0, y: 150, width: 640, height: 100, color: '#666' },
      { type: 'railing', x: 0, y: 140, width: 640, height: 10, color: '#888' },
      { type: 'railing', x: 0, y: 250, width: 640, height: 10, color: '#888' },
      { type: 'vehicle', speed: 2.5, color: '#ffaa00' },
      { type: 'truck', speed: 1.8, color: '#ff4444' }
    ]
  }
};

// Create a location-specific canvas simulation
export const createSimulatedVideo = (canvas, cameraId) => {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  const config = LOCATION_CONFIGS[cameraId] || LOCATION_CONFIGS['CAM001'];
  let animationId;
  
  const animate = () => {
    // Clear canvas with location-specific background
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, width, height);
    
    const time = Date.now() * 0.001;
    
    // Draw static elements
    config.elements.forEach(element => {
      if (element.type === 'building' || element.type === 'platform' || element.type === 'tracks' || 
          element.type === 'gate' || element.type === 'jetbridge' || element.type === 'aircraft' ||
          element.type === 'store' || element.type === 'corridor' || element.type === 'tree' ||
          element.type === 'path' || element.type === 'bridge' || element.type === 'railing') {
        ctx.fillStyle = element.color;
        ctx.fillRect(element.x, element.y, element.width, element.height);
      }
    });
    
    // Draw moving elements
    config.elements.forEach(element => {
      if (element.type === 'pedestrian' || element.type === 'passenger' || 
          element.type === 'shopper' || element.type === 'visitor') {
        ctx.fillStyle = element.color;
        const x = (Math.sin(time * element.speed) * 0.4 + 0.5) * (width - 20);
        const y = height * 0.8;
        ctx.fillRect(x, y, 20, 30);
      } else if (element.type === 'car' || element.type === 'vehicle') {
        ctx.fillStyle = element.color;
        const x = (Math.sin(time * element.speed) * 0.6 + 0.5) * (width - 60);
        const y = height * 0.75;
        ctx.fillRect(x, y, 60, 25);
      } else if (element.type === 'train') {
        ctx.fillStyle = element.color;
        const x = (Math.sin(time * element.speed) * 0.8 + 0.1) * (width - 200);
        const y = height * 0.73;
        ctx.fillRect(x, y, 200, 40);
      } else if (element.type === 'truck') {
        ctx.fillStyle = element.color;
        const x = (Math.sin(time * element.speed + Math.PI) * 0.6 + 0.5) * (width - 80);
        const y = height * 0.72;
        ctx.fillRect(x, y, 80, 35);
      }
    });
    
    // Add detection overlay
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    const radius = 40 + Math.sin(time * 3) * 10;
    ctx.beginPath();
    ctx.arc(width * 0.7, height * 0.3, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add scan lines effect
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < height; i += 4) {
      if ((i + Math.floor(time * 50)) % 8 < 2) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    }
    
    // Camera info
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText(cameraId, 15, 30);
    ctx.font = '12px monospace';
    ctx.fillText(config.name, 15, 50);
    ctx.fillText(new Date().toLocaleTimeString(), 15, height - 15);
    
    // Status indicator
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(width - 30, 30, 8, 0, Math.PI * 2);
    ctx.fill();
    
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