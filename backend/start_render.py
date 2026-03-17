#!/usr/bin/env python3
"""
Render deployment startup script for Smart City Surveillance
Handles build issues and starts the server properly
"""
import os
import sys
import subprocess
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def install_dependencies():
    """Install dependencies with proper error handling"""
    try:
        logger.info("🔧 Installing dependencies...")
        
        # Upgrade pip and build tools first
        subprocess.run([
            sys.executable, "-m", "pip", "install", 
            "--upgrade", "pip", "setuptools", "wheel"
        ], check=True)
        
        # Install requirements
        subprocess.run([
            sys.executable, "-m", "pip", "install", 
            "-r", "requirements.txt"
        ], check=True)
        
        logger.info("✅ Dependencies installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    try:
        logger.info("🚀 Starting Smart City Surveillance Backend...")
        
        # Set environment variables
        os.environ.setdefault("HOST", "0.0.0.0")
        os.environ.setdefault("PORT", str(os.environ.get("PORT", 8000)))
        
        # Import and run the app
        import uvicorn
        from main import app
        
        port = int(os.environ.get("PORT", 8000))
        
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            log_level="info"
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to start server: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    logger.info("🌟 Smart City Surveillance - Render Deployment")
    
    # Install dependencies if needed
    if not install_dependencies():
        logger.error("❌ Dependency installation failed")
        sys.exit(1)
    
    # Start the server
    start_server()

if __name__ == "__main__":
    main()