@echo off
echo ========================================
echo  SMART CITY SURVEILLANCE SYSTEM
echo  Starting servers...
echo ========================================

echo.
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd backend && uvicorn app:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  SERVERS STARTING...
echo ========================================
echo.
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:5173/
echo.
echo Wait 10-15 seconds for servers to fully initialize...
echo Then open: http://localhost:5173/
echo.
echo Press any key to open the application in browser...
pause >nul

start http://localhost:5173/

echo.
echo ========================================
echo  SYSTEM READY!
echo ========================================
echo.
echo Enhanced Features Active:
echo - Traffic Detection: traffic.mp4 shows "Heavy Traffic"
echo - Toy Gun Safety: toy_gun.mp4 shows "Safe"  
echo - Single Event Detection: 1 detection per event
echo - Professional UI: Clean detection results
echo.
echo Press any key to exit...
pause >nul