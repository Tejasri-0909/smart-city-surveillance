#!/usr/bin/env python3
"""
Smart City Surveillance - Frontend Startup Script
Starts the React frontend development server
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_node_version():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        version = result.stdout.strip()
        print(f"✅ Node.js {version} detected")
        
        # Check npm
        npm_result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        npm_version = npm_result.stdout.strip()
        print(f"✅ npm {npm_version} detected")
        
    except FileNotFoundError:
        print("❌ Node.js is not installed")
        print("💡 Please install Node.js from: https://nodejs.org/")
        sys.exit(1)

def install_dependencies():
    """Install frontend dependencies"""
    print("📦 Installing frontend dependencies...")
    
    # Change to frontend directory
    frontend_dir = Path(__file__).parent / "frontend"
    os.chdir(frontend_dir)
    
    try:
        # Install npm dependencies
        subprocess.run(["npm", "install"], check=True)
        print("✅ Frontend dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        print("💡 Try running: cd frontend && npm install")
        sys.exit(1)

def start_dev_server():
    """Start the Vite development server"""
    print("🚀 Starting Smart City Surveillance Frontend...")
    print("📍 Frontend will be available at: http://localhost:5173")
    print("🔄 Hot reload enabled for development")
    print("\n" + "="*50)
    
    try:
        # Start Vite dev server
        subprocess.run(["npm", "run", "dev"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Development server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Development server failed to start: {e}")
        sys.exit(1)

def main():
    """Main startup function"""
    print("🌟 Smart City AI Surveillance System - Frontend Startup")
    print("="*60)
    
    # Check Node.js version
    check_node_version()
    
    # Install dependencies
    install_dependencies()
    
    # Start development server
    start_dev_server()

if __name__ == "__main__":
    main()