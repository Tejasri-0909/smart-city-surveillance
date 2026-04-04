@echo off
echo ========================================
echo Smart City AI Surveillance System
echo Windows Startup Script
echo ========================================

echo.
echo Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo.
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting Smart City Surveillance System
echo ========================================
echo.
echo Backend API will be available at: http://localhost:8000
echo Frontend App will be available at: http://localhost:5173
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the system
echo ========================================

python start_system.py

pause