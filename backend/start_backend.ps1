# Smart City Surveillance Backend Startup Script
# PowerShell version for better Windows compatibility

Write-Host "Smart City Surveillance Backend Startup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if we're in the backend directory
if (-not (Test-Path "main.py")) {
    Write-Host "Error: Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python not found. Please install Python 3.8+" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create virtual environment" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to activate virtual environment" -ForegroundColor Red
    Write-Host "You may need to run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "Creating sample .env file..." -ForegroundColor Yellow
    @"
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your-secret-key-here
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Please edit .env file with your MongoDB credentials" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
}

# Start the server
Write-Host ""
Write-Host "Starting Smart City Surveillance Backend..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at:" -ForegroundColor Cyan
Write-Host "- API: http://localhost:8000" -ForegroundColor White
Write-Host "- Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "- Health: http://localhost:8000/health" -ForegroundColor White
Write-Host "- WebSocket: ws://localhost:8000/ws" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

try {
    python start_server.py
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
} finally {
    Read-Host "Press Enter to exit"
}