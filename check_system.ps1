#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Smart City Surveillance - System Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python
Write-Host "🐍 Checking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found" -ForegroundColor Red
    $pythonOk = $false
}

# Check Node.js
Write-Host "🟢 Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    $npmVersion = npm --version 2>&1
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    $nodeOk = $false
}

# Check backend dependencies
Write-Host "📦 Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend/requirements.txt") {
    Write-Host "✅ requirements.txt found" -ForegroundColor Green
} else {
    Write-Host "❌ requirements.txt not found" -ForegroundColor Red
}

# Check frontend dependencies
Write-Host "📦 Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend/package.json") {
    Write-Host "✅ package.json found" -ForegroundColor Green
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
}

# Check if servers are running
Write-Host "🌐 Checking if servers are running..." -ForegroundColor Yellow

try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend server is running (Port 8000)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend server not running (Port 8000)" -ForegroundColor Yellow
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Frontend server is running (Port 5173)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend server not running (Port 5173)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " System Check Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. If servers are not running, use: ./start_system.ps1" -ForegroundColor White
Write-Host "2. Open browser to: http://localhost:5173" -ForegroundColor White
Write-Host "3. Check API docs at: http://localhost:8000/docs" -ForegroundColor White

Read-Host "Press Enter to exit"