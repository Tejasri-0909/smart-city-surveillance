#!/usr/bin/env pwsh

Write-Host "🔧 Fixing React Reload Issue..." -ForegroundColor Yellow
Write-Host ""

# Kill any existing frontend processes
Write-Host "Stopping existing frontend processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "✅ Fixed infinite reload loop in AlertContext" -ForegroundColor Green
Write-Host "✅ Disabled React StrictMode temporarily" -ForegroundColor Green
Write-Host "✅ Updated Vite configuration" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Starting frontend with fixes..." -ForegroundColor Yellow
Set-Location frontend

# Clear npm cache
npm cache clean --force

# Start the development server
Write-Host "Frontend will open at: http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host ""

npm run dev