#!/usr/bin/env python3
"""
Build script for Smart City Surveillance Backend
Handles optional dependencies gracefully for deployment
"""
import subprocess
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def install_core_dependencies():
    """Install core dependencies that are required"""
    core_deps = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "pydantic==2.5.0",
        "python-dotenv==1.0.0",
        "python-multipart==0.0.6",
        "motor==3.3.2",
        "python-jose[cryptography]==3.3.0",
        "passlib[bcrypt]==1.7.4",
        "websockets==12.0",
    ]
    
    for dep in core_deps:
        try:
            logger.info(f"Installing {dep}...")
            subprocess.run([sys.executable, "-m", "pip", "install", dep], check=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install {dep}: {e}")
            return False
    
    return True

def install_optional_dependencies():
    """Install optional AI dependencies (may fail on some platforms)"""
    optional_deps = [
        "ultralytics==8.0.196",
        "opencv-python-headless==4.8.1.78",
        "numpy==1.24.3",
        "Pillow==10.1.0",
    ]
    
    for dep in optional_deps:
        try:
            logger.info(f"Installing optional dependency {dep}...")
            subprocess.run([sys.executable, "-m", "pip", "install", dep], check=True)
            logger.info(f"✅ Successfully installed {dep}")
        except subprocess.CalledProcessError as e:
            logger.warning(f"⚠️ Failed to install optional dependency {dep}: {e}")
            logger.info("Continuing without AI features...")

def main():
    """Main build function"""
    logger.info("🔧 Building Smart City Surveillance Backend...")
    
    # Upgrade pip first
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", 
            "--upgrade", "pip", "setuptools", "wheel"
        ], check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to upgrade pip: {e}")
        return False
    
    # Install core dependencies
    if not install_core_dependencies():
        logger.error("❌ Failed to install core dependencies")
        return False
    
    # Install optional dependencies
    install_optional_dependencies()
    
    logger.info("✅ Build completed successfully!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)