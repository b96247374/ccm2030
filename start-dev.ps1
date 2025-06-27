# Military Reports System - Development Server Startup Script
# This script starts the development server with hot reload

Write-Host "🚀 بدء تشغيل نظام إدارة التقارير العسكرية - وضع التطوير..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 تثبيت التبعيات..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ فشل في تثبيت التبعيات" -ForegroundColor Red
        exit 1
    }
}

# Get local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*", "Ethernet*" | Where-Object { $_.IPAddress -notmatch "^127\." -and $_.IPAddress -notmatch "^169\.254\." } | Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = "localhost"
}

Write-Host ""
Write-Host "🌐 سيتم تشغيل الخادم على العناوين التالية:" -ForegroundColor Cyan
Write-Host "   📱 للجوال والأجهزة الأخرى: http://${localIP}:3000" -ForegroundColor Yellow
Write-Host "   💻 للكمبيوتر المحلي: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 بدء تشغيل خادم التطوير مع Hot Reload..." -ForegroundColor Green
Write-Host "   للإيقاف اضغط Ctrl+C" -ForegroundColor Gray
Write-Host ""

# Start the development server
npm run dev