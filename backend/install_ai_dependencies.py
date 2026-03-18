#!/usr/bin/env python3
"""
AI Dependencies Installation Script
Installs YOLO and computer vision dependencies for real AI analysis
"""

import subprocess
import sys
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_command(command, description):
    """Run a command and handle errors"""
    logger.info(f"🔧 {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        logger.info(f"✅ {description} - Success")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ {description} - Failed: {e}")
        logger.error(f"Error output: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        logger.error("❌ Python 3.8+ is required for AI dependencies")
        return False
    
    logger.info(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def install_ai_dependencies():
    """Install AI and computer vision dependencies"""
    
    logger.info("🚀 Starting AI dependencies installation...")
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Install dependencies one by one for better error handling
    dependencies = [
        ("pip install --upgrade pip", "Upgrading pip"),
        ("pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu", "Installing PyTorch (CPU version)"),
        ("pip install ultralytics", "Installing YOLOv8 (Ultralytics)"),
        ("pip install opencv-python", "Installing OpenCV"),
        ("pip install numpy", "Installing NumPy"),
        ("pip install Pillow", "Installing Pillow (PIL)"),
        ("pip install aiofiles", "Installing async file handling")
    ]
    
    success_count = 0
    
    for command, description in dependencies:
        if run_command(command, description):
            success_count += 1
        else:
            logger.warning(f"⚠️ Failed to install: {description}")
    
    logger.info(f"📊 Installation complete: {success_count}/{len(dependencies)} packages installed")
    
    # Download YOLO model
    logger.info("📥 Downloading YOLOv8 model...")
    try:
        from ultralytics import YOLO
        model = YOLO('yolov8n.pt')  # This will download the model
        logger.info("✅ YOLOv8 model downloaded successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to download YOLO model: {e}")
        return False

def verify_installation():
    """Verify that all AI dependencies are working"""
    
    logger.info("🔍 Verifying AI installation...")
    
    try:
        # Test imports
        import torch
        import cv2
        import numpy as np
        from ultralytics import YOLO
        from PIL import Image
        
        logger.info("✅ All AI packages imported successfully")
        
        # Test YOLO model
        model = YOLO('yolov8n.pt')
        logger.info("✅ YOLO model loaded successfully")
        
        # Test OpenCV
        test_image = np.zeros((100, 100, 3), dtype=np.uint8)
        gray = cv2.cvtColor(test_image, cv2.COLOR_BGR2GRAY)
        logger.info("✅ OpenCV working correctly")
        
        # Test PyTorch
        tensor = torch.tensor([1, 2, 3])
        logger.info(f"✅ PyTorch working correctly (version: {torch.__version__})")
        
        logger.info("🎉 All AI dependencies verified and working!")
        return True
        
    except ImportError as e:
        logger.error(f"❌ Import error: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Verification error: {e}")
        return False

def main():
    """Main installation function"""
    
    print("=" * 60)
    print("🤖 Smart City AI Surveillance - AI Dependencies Installer")
    print("=" * 60)
    
    # Install dependencies
    if install_ai_dependencies():
        logger.info("✅ AI dependencies installation completed")
        
        # Verify installation
        if verify_installation():
            logger.info("🎉 AI system is ready for real threat detection!")
            print("\n" + "=" * 60)
            print("✅ INSTALLATION SUCCESSFUL")
            print("🤖 Real AI analysis with YOLO is now available!")
            print("🔍 The system can detect:")
            print("   • People and crowds")
            print("   • Weapons and dangerous objects")
            print("   • Vehicles in restricted areas")
            print("   • Suspicious activities")
            print("   • Unattended objects")
            print("=" * 60)
            return True
        else:
            logger.error("❌ Installation verification failed")
            return False
    else:
        logger.error("❌ AI dependencies installation failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)