# Port Cleanup Script for Development Environment
# This script kills Node.js processes that are using common development ports

Write-Host "🧹 Cleaning up development ports..." -ForegroundColor Green

# Function to safely kill a process
function Kill-ProcessSafely {
    param([int]$ProcessId, [string]$Port)
    
    try {
        $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "🔸 Killing process $ProcessId (Port $Port): $($process.ProcessName)" -ForegroundColor Yellow
            Stop-Process -Id $ProcessId -Force
            Write-Host "✅ Successfully killed process $ProcessId" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  Process $ProcessId not found (may have already stopped)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Failed to kill process $ProcessId : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Get current port usage
Write-Host "📊 Checking current port usage..." -ForegroundColor Cyan
$portInfo = netstat -ano | findstr ":300"
if ($portInfo) {
    Write-Host "Current development ports in use:" -ForegroundColor White
    $portInfo
} else {
    Write-Host "No development ports (3000-3009) currently in use." -ForegroundColor Green
    exit 0
}

Write-Host ""

# Kill processes using development ports 3000-3004
$developmentPorts = @(
    @{Port="3000"; PID=14732},
    @{Port="3001"; PID=23044}, 
    @{Port="3002"; PID=42224},
    @{Port="3003"; PID=38276},
    @{Port="3004"; PID=45216}
)

foreach ($portInfo in $developmentPorts) {
    Kill-ProcessSafely -ProcessId $portInfo.PID -Port $portInfo.Port
}

# Wait a moment for processes to terminate
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "🔍 Checking for any remaining Node.js processes on development ports..." -ForegroundColor Cyan

# Check for any remaining processes on development ports
$remainingPorts = netstat -ano | findstr ":300"
if ($remainingPorts) {
    Write-Host "⚠️  Some development ports are still in use:" -ForegroundColor Yellow
    $remainingPorts
    Write-Host ""
    Write-Host "💡 You may need to manually close these applications or run this script again." -ForegroundColor Yellow
} else {
    Write-Host "✅ All development ports (3000-3009) are now available!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🏃 Available ports for development:" -ForegroundColor Cyan
Write-Host "  • Port 3000 - Main development server" -ForegroundColor White
Write-Host "  • Port 3001 - Secondary server" -ForegroundColor White
Write-Host "  • Port 3002 - Additional services" -ForegroundColor White
Write-Host "  • Port 3003 - Testing/staging" -ForegroundColor White
Write-Host "  • Port 3004 - Background services" -ForegroundColor White

Write-Host ""
Write-Host "✨ Port cleanup complete! You can now start your development servers." -ForegroundColor Green