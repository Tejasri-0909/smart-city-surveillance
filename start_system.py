#!/usr/bin/env python3
"""
Smart City Surveillance - Complete System Startup Script
Starts both backend and frontend servers simultaneously
"""

import os
import sys
import subprocess
import time
import threading
from pathlib import Path

def run_backend():
    """Run backend server in a separate thread"""
    print("🔧 Starting backend server...")
    try:
        subprocess.run([sys.executable, "start_backend.py"])
    except Exception as e:
        print(f"❌ Backend error: {e}")

def run_frontend():
    """Run frontend server in a separate thread"""
    print("🎨 Starting frontend server...")
    time.sleep(3)  # Wait for backend to start first
    try:
        subprocess.run([sys.executable, "start_frontend.py"])
    except Exception as e:
        print(f"❌ Frontend error: {e}")

def main():
    """Main function to start both servers"""
    print("🌟 Smart City AI Surveillance System - Complete Startup")
    print("="*60)
    print("🚀 Starting both backend and frontend servers...")
    print("\n📍 Backend API: http://localhost:8000")
    print("📍 Frontend App: http://localhost:5173")
    print("📊 API Docs: http://localhost:8000/docs")
    print("\n💡 Press Ctrl+C to stop both servers")
    print("="*60)
    
    try:
        # Start backend in a separate thread
        backend_thread = threading.Thread(target=run_backend, daemon=True)
        backend_thread.start()
        
        # Wait a moment for backend to initialize
        time.sleep(5)
        
        # Start frontend in main thread
        run_frontend()
        
    except KeyboardInterrupt:
        print("\n🛑 System stopped by user")
        print("✅ Both servers have been terminated")

if __name__ == "__main__":
    main()