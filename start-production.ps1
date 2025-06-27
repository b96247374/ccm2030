# Military Reports System - Enhanced Production Server
# This script uses Express.js for better performance and features

Write-Host "🚀 تشغيل نظام إدارة التقارير العسكرية - الإصدار المحسن" -ForegroundColor Green

# Check Node.js version
try {
    $nodeVersion = node --version
    $versionNumber = [version]($nodeVersion -replace 'v', '')
    if ($versionNumber -lt [version]"16.0.0") {
        Write-Host "⚠️ تحذير: يُنصح بـ Node.js الإصدار 16 أو أحدث" -ForegroundColor Yellow
    }
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً." -ForegroundColor Red
    Write-Host "   قم بتحميله من: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Create directories if they don't exist
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" -Force | Out-Null
}

if (-not (Test-Path "dist") -or -not (Test-Path "node_modules")) {
    Write-Host "📦 تثبيت التبعيات وبناء المشروع..." -ForegroundColor Yellow
    
    # Install dependencies
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ فشل في تثبيت التبعيات" -ForegroundColor Red
        exit 1
    }
    
    # Build project
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ فشل في بناء المشروع" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ المشروع جاهز للتشغيل!" -ForegroundColor Green
}

# Get network information
$localIP = "localhost"
$networkInterfaces = @()

try {
    $interfaces = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.IPAddress -notmatch "^127\." -and 
        $_.IPAddress -notmatch "^169\.254\." -and
        $_.InterfaceAlias -notmatch "Loopback"
    }
    
    foreach ($interface in $interfaces) {
        $networkInterfaces += @{
            IP = $interface.IPAddress
            Name = $interface.InterfaceAlias
        }
    }
    
    if ($networkInterfaces.Count -gt 0) {
        $localIP = $networkInterfaces[0].IP
    }
} catch {
    Write-Host "⚠️ تعذر الحصول على معلومات الشبكة" -ForegroundColor Yellow
}

# Display server information
Write-Host ""
Write-Host "🌐 معلومات الخادم:" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
Write-Host "   🖥️  المنفذ: 3000" -ForegroundColor White
Write-Host "   💻 الكمبيوتر المحلي: http://localhost:3000" -ForegroundColor Yellow

if ($networkInterfaces.Count -gt 0) {
    Write-Host "   📱 الوصول من الأجهزة الأخرى:" -ForegroundColor White
    foreach ($interface in $networkInterfaces) {
        Write-Host "      • $($interface.Name): http://$($interface.IP):3000" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  لم يتم العثور على شبكات متاحة" -ForegroundColor Yellow
}

Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ الميزات المفعلة:" -ForegroundColor Cyan
Write-Host "   🛡️ الحماية المتقدمة (Security Headers)" -ForegroundColor Green
Write-Host "   🗜️ ضغط الملفات التلقائي (Gzip)" -ForegroundColor Green
Write-Host "   📦 التخزين المؤقت الذكي" -ForegroundColor Green
Write-Host "   📱 دعم PWA كامل" -ForegroundColor Green
Write-Host "   🔄 توجيه العميل (Client-side routing)" -ForegroundColor Green
Write-Host "   📊 مراقبة الأداء" -ForegroundColor Green
Write-Host ""

Write-Host "🔄 بدء تشغيل الخادم المحسن..." -ForegroundColor Green
Write-Host "   للإيقاف اضغط Ctrl+C" -ForegroundColor Gray
Write-Host ""

# Start the enhanced Express server
npm run serve-express