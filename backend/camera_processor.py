"""
Camera Stream Processor for Smart City Surveillance System
Processes video feeds and detects incidents using AI
"""

import asyncio
import logging
from typing import Dict, Optional, Callable
from datetime import datetime
import threading
import time
from pathlib import Path

# Try to import AI dependencies, handle gracefully if missing
try:
    import cv2
    from ai_detection import detect_threats_in_frame
    AI_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("✅ AI detection modules loaded successfully")
except ImportError as e:
    AI_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning(f"⚠️ AI detection not available: {e}")
    logger.info("📱 Running in simulation mode without AI processing")

# Configure logging
logging.basicConfig(level=logging.INFO)

class CameraProcessor:
    def __init__(self, alert_callback: Optional[Callable] = None):
        self.cameras = {}
        self.processing = False
        self.alert_callback = alert_callback
        self.detection_cooldown = {}  # Prevent spam alerts
        self.cooldown_duration = 30  # seconds
        
        # Camera configuration
        self.camera_config = {
            'CAM001': {
                'source': 'frontend/public/cctv/cam1.mp4',
                'location': 'City Center',
                'coordinates': (40.7128, -74.0060)
            },
            'CAM002': {
                'source': 'frontend/public/cctv/cam2.mp4', 
                'location': 'Metro Station',
                'coordinates': (40.7589, -73.9851)
            },
            'CAM003': {
                'source': 'frontend/public/cctv/cam3.mp4',
                'location': 'Airport Gate',
                'coordinates': (40.6892, -74.1745)
            },
            'CAM004': {
                'source': 'frontend/public/cctv/cam4.mp4',
                'location': 'Shopping Mall', 
                'coordinates': (40.7505, -73.9934)
            },
            'CAM005': {
                'source': 'frontend/public/cctv/cam5.mp4',
                'location': 'Park Entrance',
                'coordinates': (40.7829, -73.9654)
            },
            'CAM006': {
                'source': 'frontend/public/cctv/cam6.mp4',
                'location': 'Highway Bridge',
                'coordinates': (40.7282, -74.0776)
            }
        }

    def start_processing(self):
        """Start processing all camera feeds"""
        if self.processing:
            logger.warning("Camera processing already running")
            return
            
        self.processing = True
        logger.info("Starting camera processing...")
        
        # Start processing each camera in a separate thread
        for camera_id in self.camera_config.keys():
            thread = threading.Thread(
                target=self._process_camera_feed,
                args=(camera_id,),
                daemon=True
            )
            thread.start()
            logger.info(f"Started processing thread for {camera_id}")

    def stop_processing(self):
        """Stop processing all camera feeds"""
        self.processing = False
        logger.info("Stopping camera processing...")

    def _process_camera_feed(self, camera_id: str):
        """Process a single camera feed"""
        config = self.camera_config.get(camera_id)
        if not config:
            logger.error(f"No configuration found for {camera_id}")
            return
            
        source = config['source']
        
        # Check if video file exists
        if not Path(source).exists():
            logger.warning(f"Video file not found for {camera_id}: {source}")
            # Use simulated processing instead
            self._simulate_camera_processing(camera_id)
            return
            
        logger.info(f"Processing camera {camera_id} from {source}")
        
        while self.processing:
            try:
                cap = cv2.VideoCapture(source)
                
                if not cap.isOpened():
                    logger.error(f"Failed to open video source for {camera_id}")
                    time.sleep(5)
                    continue
                
                frame_count = 0
                while self.processing and cap.isOpened():
                    ret, frame = cap.read()
                    
                    if not ret:
                        # Loop the video
                        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        continue
                    
                    # Process every 30th frame (1 FPS if source is 30 FPS)
                    if frame_count % 30 == 0:
                        incident = self._analyze_frame(frame, camera_id)
                        if incident:
                            # Handle incident synchronously in thread
                            try:
                                if asyncio.iscoroutinefunction(self.alert_callback):
                                    # Create a new event loop for this thread
                                    loop = asyncio.new_event_loop()
                                    asyncio.set_event_loop(loop)
                                    loop.run_until_complete(self._handle_incident(incident))
                                    loop.close()
                                else:
                                    self.alert_callback(incident)
                            except Exception as e:
                                logger.error(f"Error handling incident: {e}")
                    
                    frame_count += 1
                    time.sleep(0.033)  # ~30 FPS processing
                    
                cap.release()
                
            except Exception as e:
                logger.error(f"Error processing {camera_id}: {e}")
                time.sleep(5)

    def _simulate_camera_processing(self, camera_id: str):
        """Simulate camera processing when video files are not available"""
        logger.info(f"Simulating processing for {camera_id}")
        
        while self.processing:
            try:
                # Simulate frame analysis with random incidents
                incident = detect_threats_in_frame(None, camera_id)
                if incident:
                    # Create a new event loop for the async callback if needed
                    if asyncio.iscoroutinefunction(self.alert_callback):
                        try:
                            loop = asyncio.get_event_loop()
                            if loop.is_running():
                                # If loop is already running, schedule the coroutine
                                asyncio.create_task(self._handle_incident(incident))
                            else:
                                # If no loop is running, run it
                                loop.run_until_complete(self._handle_incident(incident))
                        except RuntimeError:
                            # If no event loop exists, create one
                            asyncio.run(self._handle_incident(incident))
                    else:
                        self.alert_callback(incident)
                    
                time.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                logger.error(f"Error in simulation for {camera_id}: {e}")
                time.sleep(5)

    def _analyze_frame(self, frame, camera_id: str) -> Optional[Dict]:
        """Analyze a video frame for threats"""
        try:
            return detect_threats_in_frame(frame, camera_id)
        except Exception as e:
            logger.error(f"Frame analysis error for {camera_id}: {e}")
            return None

    async def _handle_incident(self, incident: Dict):
        """Handle detected incident"""
        camera_id = incident['camera_id']
        current_time = time.time()
        
        # Check cooldown to prevent spam
        last_alert = self.detection_cooldown.get(camera_id, 0)
        if current_time - last_alert < self.cooldown_duration:
            return
            
        self.detection_cooldown[camera_id] = current_time
        
        # Add additional incident data
        config = self.camera_config.get(camera_id, {})
        incident.update({
            'id': int(current_time * 1000),  # Unique ID
            'status': 'active',
            'coordinates': config.get('coordinates'),
            'message': f"{incident['incident_type']} detected at {incident['camera_id']} ({incident['location']})"
        })
        
        logger.info(f"Incident detected: {incident}")
        
        # Call the alert callback if provided
        if self.alert_callback:
            try:
                if asyncio.iscoroutinefunction(self.alert_callback):
                    await self.alert_callback(incident)
                else:
                    self.alert_callback(incident)
            except Exception as e:
                logger.error(f"Error calling alert callback: {e}")

    def get_camera_status(self) -> Dict:
        """Get status of all cameras"""
        status = {}
        for camera_id, config in self.camera_config.items():
            video_exists = Path(config['source']).exists()
            status[camera_id] = {
                'location': config['location'],
                'coordinates': config['coordinates'],
                'video_available': video_exists,
                'status': 'active' if self.processing else 'inactive'
            }
        return status

# Global camera processor instance
camera_processor = None

def initialize_camera_processor(alert_callback: Optional[Callable] = None):
    """Initialize the global camera processor"""
    global camera_processor
    camera_processor = CameraProcessor(alert_callback)
    return camera_processor

def start_camera_processing():
    """Start camera processing"""
    if camera_processor:
        camera_processor.start_processing()
    else:
        logger.error("Camera processor not initialized")

def stop_camera_processing():
    """Stop camera processing"""
    if camera_processor:
        camera_processor.stop_processing()

def get_camera_status():
    """Get camera status"""
    if camera_processor:
        return camera_processor.get_camera_status()
    return {}