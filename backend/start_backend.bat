@echo off
echo Smart City Surveillance Backend Startup
echo =====================================

REM Check if we're in the backend directory
if not exist "main.py" (
    echo Error: Please run this script from the backend directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo Error: Failed to create virtual environment
        echo Make sure Python 3.8+ is installed
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Error: Failed to activate virtual environment
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found
    echo Creating sample .env file...
    echo MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/ > .env
    echo JWT_SECRET=your-secret-key-here >> .env
    echo Please edit .env file with your MongoDB credentials
    pause
)

REM Start the server
echo Starting Smart City Surveillance Backend...
echo.
echo Backend will be available at:
echo - API: http://localhost:8000
echo - Docs: http://localhost:8000/docs
echo - Health: http://localhost:8000/health
echo - WebSocket: ws://localhost:8000/ws
echo.
echo Press Ctrl+C to stop the server
echo.

python start_server.py

pause