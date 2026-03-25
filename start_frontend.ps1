#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Smart City AI Surveillance - Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Stopping any existing processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*vite*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleared existing processes" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Installing Node.js dependencies..." -ForegroundColor Yellow
Set-Location frontend

try {
    # Clear cache to prevent issues
    npm cache clean --force
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[4/4] Starting React development server..." -ForegroundColor Yellow
Write-Host "🚀 Frontend will be available at: http://localhost:5173" -ForegroundColor Green
Write-Host "✅ Fixed infinite reload issue" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host "❌ Failed to start frontend server" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}