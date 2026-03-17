"""
AI Detection Module for Smart City Surveillance System
Uses YOLOv8 for object detection and threat identification
"""

import cv2
import numpy as np
from datetime import datetime
import random
import logging
from typing import List, Dict, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
    logger.info("YOLOv8 available - using real AI detection")
except ImportError:
    YOLO_AVAILABLE = False
    logger.warning("YOLOv8 not available - using simulated detection")

class AIDetector:
    def __init__(self):
        self.model = None
        self.threat_classes = {
            'weapon': ['knife', 'gun', 'rifle', 'pistol'],
            'fire': ['fire', 'smoke', 'flame'],
            'suspicious': ['person', 'crowd', 'gathering'],
            'vehicle': ['car', 'truck', 'motorcycle'],
            'vandalism': ['spray_paint', 'graffiti']
        }
        
        if YOLO_AVAILABLE:
            try:
                self.model = YOLO("yolov8n.pt")
                logger.info("YOLOv8 model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load YOLOv8 model: {e}")
                self.model = None

    def detect_objects(self, frame: np.ndarray) -> List[Dict]:
        """
        Detect objects in a video frame
        Returns list of detection objects
        """
        detections = []
        
        if self.model and YOLO_AVAILABLE:
            try:
                results = self.model(frame)
                for r in results:
                    for box in r.boxes:
                        cls = int(box.cls[0])
                        confidence = float(box.conf[0])
                        
                        # Get class name
                        class_name = self.model.names[cls] if cls < len(self.model.names) else "unknown"
                        
                        # Check if it's a threat
                        threat_type = self._classify_threat(class_name)
                        
                        if threat_type and confidence > 0.5:
                            detections.append({
                                'class': class_name,
                                'confidence': confidence,
                                'threat_type': threat_type,
                                'bbox': box.xyxy[0].tolist() if hasattr(box, 'xyxy') else None
                            })
            except Exception as e:
                logger.error(f"Detection error: {e}")
                
        else:
            # Simulated detection for demo purposes
            detections = self._simulate_detection()
            
        return detections

    def _classify_threat(self, class_name: str) -> Optional[str]:
        """Classify detected object as a threat type"""
        for threat_type, classes in self.threat_classes.items():
            if any(threat_class in class_name.lower() for threat_class in classes):
                return threat_type
        return None

    def _simulate_detection(self) -> List[Dict]:
        """Simulate AI detection for demo purposes"""
        # Random chance of detection (10% per frame)
        if random.random() < 0.1:
            threat_types = ['weapon', 'suspicious', 'fire', 'vandalism']
            threat_type = random.choice(threat_types)
            
            return [{
                'class': f'simulated_{threat_type}',
                'confidence': random.uniform(0.6, 0.95),
                'threat_type': threat_type,
                'bbox': [100, 100, 300, 300]  # Simulated bounding box
            }]
        return []

    def analyze_frame(self, frame: np.ndarray, camera_id: str) -> Optional[Dict]:
        """
        Analyze a single frame and return incident data if threat detected
        """
        detections = self.detect_objects(frame)
        
        if detections:
            # Get the highest confidence detection
            best_detection = max(detections, key=lambda x: x['confidence'])
            
            # Map threat types to incident types
            incident_mapping = {
                'weapon': 'Weapon Detected',
                'fire': 'Fire Detected', 
                'suspicious': 'Suspicious Activity',
                'vandalism': 'Vandalism',
                'vehicle': 'Unauthorized Access'
            }
            
            incident_type = incident_mapping.get(
                best_detection['threat_type'], 
                'Suspicious Activity'
            )
            
            # Map camera locations
            camera_locations = {
                'CAM001': 'City Center',
                'CAM002': 'Metro Station',
                'CAM003': 'Airport Gate', 
                'CAM004': 'Shopping Mall',
                'CAM005': 'Park Entrance',
                'CAM006': 'Highway Bridge'
            }
            
            # Determine severity based on threat type
            severity_mapping = {
                'weapon': 'critical',
                'fire': 'critical',
                'suspicious': 'medium',
                'vandalism': 'low',
                'vehicle': 'high'
            }
            
            return {
                'camera_id': camera_id,
                'incident_type': incident_type,
                'location': camera_locations.get(camera_id, 'Unknown'),
                'severity': severity_mapping.get(best_detection['threat_type'], 'medium'),
                'confidence': best_detection['confidence'],
                'timestamp': datetime.utcnow().isoformat(),
                'detection_data': best_detection
            }
            
        return None

# Global detector instance
detector = AIDetector()

def detect_threats_in_frame(frame: np.ndarray, camera_id: str) -> Optional[Dict]:
    """
    Main function to detect threats in a video frame
    """
    return detector.analyze_frame(frame, camera_id)

def get_detector_status() -> Dict:
    """Get the current status of the AI detector"""
    return {
        'yolo_available': YOLO_AVAILABLE,
        'model_loaded': detector.model is not None,
        'threat_classes': list(detector.threat_classes.keys())
    }