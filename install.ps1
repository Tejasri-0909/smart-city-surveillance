#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Smart City Surveillance - Installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Installing Smart City AI Surveillance System..." -ForegroundColor Yellow
Write-Host ""

# Check prerequisites
Write-Host "[1/4] Checking prerequisites..." -ForegroundColor Yellow
$pythonOk = $true
$nodeOk = $true

try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found - Please install Python 3.8+ from https://python.org" -ForegroundColor Red
    $pythonOk = $false
}

try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found - Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    $nodeOk = $false
}

if (-not $pythonOk -or -not $nodeOk) {
    Write-Host ""
    Write-Host "❌ Prerequisites missing. Please install the required software and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install backend dependencies
Write-Host ""
Write-Host "[2/4] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
try {
    pip install -r requirements.txt
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install frontend dependencies
Write-Host ""
Write-Host "[3/4] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
try {
    npm install
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Install root dependencies (optional)
Write-Host ""
Write-Host "[4/4] Installing development tools..." -ForegroundColor Yellow
Set-Location ..
try {
    npm install
    Write-Host "✅ Development tools installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Development tools installation failed (optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Installation Complete! 🎉" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Ready to run! Use one of these commands:" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Yellow
Write-Host "  ./start_system.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Manual Start:" -ForegroundColor Yellow
Write-Host "  ./start_backend.ps1    # Terminal 1" -ForegroundColor White
Write-Host "  ./start_frontend.ps1   # Terminal 2" -ForegroundColor White
Write-Host ""
Write-Host "System Check:" -ForegroundColor Yellow
Write-Host "  ./check_system.ps1" -ForegroundColor White
Write-Host ""

Write-Host "📖 For detailed instructions, see: RUN_LOCALLY.md" -ForegroundColor Cyan

Read-Host "Press Enter to exit"