@echo off
echo Starting Smart City Surveillance 24/7 System...
echo ================================================

:start
echo [%date% %time%] Starting backend server...
python start_24_7.py

echo [%date% %time%] Server stopped. Restarting in 5 seconds...
timeout /t 5 /nobreak > nul
goto start