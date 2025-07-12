# RefuLearn Robust Server Starter
# This script starts the server with automatic monitoring and restart capabilities

Write-Host "🚀 Starting RefuLearn Backend Server with Monitoring..." -ForegroundColor Green
Write-Host "Features:" -ForegroundColor Yellow
Write-Host "  • Automatic health monitoring every 30 seconds" -ForegroundColor Cyan
Write-Host "  • Automatic restart on failure" -ForegroundColor Cyan
Write-Host "  • Detailed logging to logs/server-monitor.log" -ForegroundColor Cyan
Write-Host "  • Graceful shutdown handling" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Create logs directory if it doesn't exist
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "📁 Created logs directory" -ForegroundColor Yellow
}

# Check if dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Starting server monitor..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server gracefully" -ForegroundColor Cyan
Write-Host ""

# Start the robust server
try {
    node restart-server.js
} catch {
    Write-Host "❌ Failed to start server monitor" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Server monitor stopped gracefully" -ForegroundColor Green 