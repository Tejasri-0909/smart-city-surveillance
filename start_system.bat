@echo off
echo ========================================
echo  Smart City AI Surveillance System
echo ========================================
echo.
echo Starting both Backend and Frontend servers...
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Close this window to stop both servers
echo.

start "Backend Server" cmd /k start_backend.bat
timeout /t 5 /nobreak > nul
start "Frontend Server" cmd /k start_frontend.bat

echo.
echo Both servers are starting...
echo Wait for both servers to be ready, then open:
echo http://localhost:5173
echo.
pause