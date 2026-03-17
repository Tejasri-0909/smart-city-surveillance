# Smart City Surveillance 24/7 PowerShell Launcher
Write-Host "🌟 Smart City Surveillance 24/7 System" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to kill processes on port 8000
function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($processId in $processes) {
            Write-Host "🛑 Stopping process $processId on port $Port" -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    } catch {
        Write-Host "⚠️ Could not stop processes on port $Port" -ForegroundColor Yellow
    }
}

# Main loop for 24/7 operation
$restartCount = 0
$maxRestarts = 100

while ($restartCount -lt $maxRestarts) {
    try {
        Write-Host "🚀 Starting backend server (attempt $($restartCount + 1))..." -ForegroundColor Cyan
        
        # Check if port is already in use
        if (Test-Port -Port 8000) {
            Write-Host "⚠️ Port 8000 is in use, stopping existing processes..." -ForegroundColor Yellow
            Stop-ProcessOnPort -Port 8000
            Start-Sleep -Seconds 3
        }
        
        # Start the server
        $process = Start-Process -FilePath "python" -ArgumentList "start_24_7.py" -NoNewWindow -PassThru
        
        Write-Host "✅ Server started with PID: $($process.Id)" -ForegroundColor Green
        Write-Host "🌐 Server running at: http://localhost:8000" -ForegroundColor Green
        Write-Host "🔗 WebSocket at: ws://localhost:8000/ws" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 System Status:" -ForegroundColor Cyan
        Write-Host "   - 24/7 Operation: ACTIVE" -ForegroundColor Green
        Write-Host "   - Auto-restart: ENABLED" -ForegroundColor Green
        Write-Host "   - Camera Monitoring: ACTIVE" -ForegroundColor Green
        Write-Host ""
        Write-Host "Press Ctrl+C to stop the system" -ForegroundColor Yellow
        Write-Host ""
        
        # Wait for process to exit
        $process.WaitForExit()
        
        $restartCount++
        Write-Host "⚠️ Server stopped unexpectedly. Restarting in 10 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
    } catch {
        Write-Host "❌ Error starting server: $($_.Exception.Message)" -ForegroundColor Red
        $restartCount++
        Start-Sleep -Seconds 15
    }
}

Write-Host "❌ Maximum restart attempts reached. System stopped." -ForegroundColor Red