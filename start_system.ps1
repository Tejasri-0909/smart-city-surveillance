#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Smart City AI Surveillance System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Starting both Backend and Frontend servers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""

# Start backend in new PowerShell window
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "start_backend.ps1"

# Wait a bit for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend in new PowerShell window
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "start_frontend.ps1"

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host "⏳ Wait for both servers to be ready, then open:" -ForegroundColor Yellow
Write-Host "🌐 http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 To stop the servers, close the PowerShell windows that opened" -ForegroundColor Yellow

Read-Host "Press Enter to exit this launcher"