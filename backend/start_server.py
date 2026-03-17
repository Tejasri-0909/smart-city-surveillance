#!/usr/bin/env python3
"""
Simple startup script for Smart City Surveillance Backend
Helps diagnose startup issues and provides better error messages
"""

import sys
import os
import logging
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required dependencies are installed"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'motor',
        'python-dotenv',
        'pydantic'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
            logger.info(f"✅ {package} - OK")
        except ImportError:
            missing_packages.append(package)
            logger.error(f"❌ {package} - MISSING")
    
    if missing_packages:
        logger.error(f"Missing packages: {missing_packages}")
        logger.error("Please install with: pip install -r requirements.txt")
        return False
    
    return True

def check_environment():
    """Check environment configuration"""
    env_file = Path('.env')
    if not env_file.exists():
        logger.warning("⚠️  .env file not found - using defaults")
        return True
    
    from dotenv import load_dotenv
    load_dotenv()
    
    mongo_url = os.getenv('MONGO_URL')
    if not mongo_url or 'mongodb' not in mongo_url:
        logger.warning("⚠️  MONGO_URL not properly configured")
    else:
        logger.info("✅ MongoDB URL configured")
    
    return True

def test_imports():
    """Test if all modules can be imported"""
    modules_to_test = [
        'database',
        'websocket_manager', 
        'ai_detection',
        'camera_processor'
    ]
    
    for module in modules_to_test:
        try:
            __import__(module)
            logger.info(f"✅ {module} - OK")
        except Exception as e:
            logger.error(f"❌ {module} - ERROR: {e}")
            return False
    
    return True

def start_server():
    """Start the FastAPI server"""
    try:
        import uvicorn
        from main import app
        
        logger.info("🚀 Starting Smart City Surveillance Backend...")
        logger.info("📡 WebSocket endpoint: ws://localhost:8000/ws")
        logger.info("🌐 API documentation: http://localhost:8000/docs")
        logger.info("❤️  Health check: http://localhost:8000/health")
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
        
    except Exception as e:
        logger.error(f"💥 Failed to start server: {e}")
        return False
    
    return True

if __name__ == "__main__":
    logger.info("🔍 Smart City Surveillance Backend - Startup Diagnostics")
    logger.info("=" * 60)
    
    # Run diagnostics
    if not check_dependencies():
        sys.exit(1)
    
    if not check_environment():
        sys.exit(1)
    
    if not test_imports():
        sys.exit(1)
    
    logger.info("✅ All checks passed - starting server...")
    logger.info("=" * 60)
    
    # Start server
    start_server()