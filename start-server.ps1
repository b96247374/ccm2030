# Military Reports System - Production Server Startup Script
# This script builds and starts the production server

Write-Host "🚀 بدء تشغيل نظام إدارة التقارير العسكرية..." -ForegroundColor Green

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

# Build the project (if dist folder doesn't exist or is older than src)
$buildNeeded = $false
if (-not (Test-Path "dist")) {
    $buildNeeded = $true
} else {
    $distTime = (Get-Item "dist").LastWriteTime
    $srcTime = (Get-ChildItem "src" -Recurse | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
    if ($srcTime -gt $distTime) {
        $buildNeeded = $true
    }
}

if ($buildNeeded) {
    Write-Host "🔨 بناء المشروع..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ فشل في بناء المشروع" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ تم بناء المشروع بنجاح!" -ForegroundColor Green
} else {
    Write-Host "✅ المشروع محدث بالفعل!" -ForegroundColor Green
}

# Get local IP address
$localIP = "localhost"
try {
    $networkAdapter = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
        $_.IPAddress -notmatch "^127\." -and 
        $_.IPAddress -notmatch "^169\.254\." -and
        $_.InterfaceAlias -notmatch "Loopback"
    } | Select-Object -First 1
    if ($networkAdapter) {
        $localIP = $networkAdapter.IPAddress
    }
} catch {
    Write-Host "⚠️ تعذر الحصول على IP المحلي، سيتم استخدام localhost" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 سيتم تشغيل الخادم على العناوين التالية:" -ForegroundColor Cyan
Write-Host "   📱 للجوال والأجهزة الأخرى: http://${localIP}:3000" -ForegroundColor Yellow
Write-Host "   💻 للكمبيوتر المحلي: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 بدء تشغيل الخادم..." -ForegroundColor Green
Write-Host "   للإيقاف اضغط Ctrl+C" -ForegroundColor Gray
Write-Host ""

# Start the simple HTTP server
node server.js