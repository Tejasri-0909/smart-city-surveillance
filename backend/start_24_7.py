#!/usr/bin/env python3
"""
24/7 Backend Server with Auto-restart and Camera Management
"""
import subprocess
import time
import sys
import os
import signal
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server_24_7.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class Server24_7:
    def __init__(self):
        self.process = None
        self.restart_count = 0
        self.max_restarts = 100  # Allow many restarts for 24/7 operation
        self.running = True
        
    def start_server(self):
        """Start the FastAPI server"""
        try:
            logger.info("🚀 Starting Smart City Surveillance Backend...")
            
            # Start server with uvicorn
            self.process = subprocess.Popen([
                sys.executable, "-m", "uvicorn", 
                "main:app", 
                "--host", "0.0.0.0", 
                "--port", "8000",
                "--reload",
                "--log-level", "info"
            ], cwd=os.path.dirname(__file__))
            
            logger.info(f"✅ Server started with PID: {self.process.pid}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to start server: {e}")
            return False
    
    def stop_server(self):
        """Stop the server gracefully"""
        if self.process:
            try:
                logger.info("🛑 Stopping server...")
                self.process.terminate()
                self.process.wait(timeout=10)
                logger.info("✅ Server stopped gracefully")
            except subprocess.TimeoutExpired:
                logger.warning("⚠️ Server didn't stop gracefully, forcing...")
                self.process.kill()
                self.process.wait()
            except Exception as e:
                logger.error(f"❌ Error stopping server: {e}")
            finally:
                self.process = None
    
    def is_server_running(self):
        """Check if server is still running"""
        if not self.process:
            return False
        
        # Check if process is still alive
        poll = self.process.poll()
        return poll is None
    
    def restart_server(self):
        """Restart the server"""
        self.restart_count += 1
        logger.info(f"🔄 Restarting server (attempt {self.restart_count}/{self.max_restarts})")
        
        self.stop_server()
        time.sleep(5)  # Wait before restart
        
        if self.restart_count < self.max_restarts:
            return self.start_server()
        else:
            logger.error("❌ Max restart attempts reached. Stopping.")
            return False
    
    def run_24_7(self):
        """Run server in 24/7 mode with auto-restart"""
        logger.info("🌟 Starting 24/7 Smart City Surveillance System")
        logger.info("📋 Features: Auto-restart, Health monitoring, 24/7 cameras")
        
        # Initial server start
        if not self.start_server():
            logger.error("❌ Failed to start server initially")
            return
        
        try:
            while self.running:
                time.sleep(30)  # Check every 30 seconds
                
                if not self.is_server_running():
                    logger.warning("⚠️ Server stopped unexpectedly, restarting...")
                    if not self.restart_server():
                        break
                else:
                    # Server is running, log status
                    if self.restart_count > 0:
                        logger.info(f"✅ Server healthy (restarts: {self.restart_count})")
                    
        except KeyboardInterrupt:
            logger.info("🛑 Received shutdown signal")
        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
        finally:
            self.running = False
            self.stop_server()
            logger.info("🏁 24/7 system shutdown complete")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"📡 Received signal {signum}")
        self.running = False

def main():
    """Main entry point"""
    server = Server24_7()
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, server.signal_handler)
    signal.signal(signal.SIGTERM, server.signal_handler)
    
    # Start 24/7 operation
    server.run_24_7()

if __name__ == "__main__":
    main()