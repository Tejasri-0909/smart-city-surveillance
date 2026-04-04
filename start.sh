#!/bin/bash

echo "========================================"
echo "Smart City AI Surveillance System"
echo "Linux/macOS Startup Script"
echo "========================================"

# Check Python installation
echo ""
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3 from https://python.org/"
    exit 1
fi
python3 --version

# Check Node.js installation
echo ""
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
node --version

echo ""
echo "========================================"
echo "Starting Smart City Surveillance System"
echo "========================================"
echo ""
echo "Backend API will be available at: http://localhost:8000"
echo "Frontend App will be available at: http://localhost:5173"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the system"
echo "========================================"

# Start the system
python3 start_system.py