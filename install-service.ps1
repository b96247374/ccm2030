# Military Reports System - Windows Service Installation
# This script installs the application as a Windows service

param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "install"
)

$ServiceName = "MilitaryReportsSystem"
$ServiceDisplayName = "نظام إدارة التقارير العسكرية"
$ServiceDescription = "نظام شامل لإدارة التقارير العسكرية - يعمل كخدمة Windows"
$CurrentPath = Get-Location
$NodePath = (Get-Command node).Source
$ScriptPath = Join-Path $CurrentPath "express-server.js"

function Install-Service {
    Write-Host "🔧 تثبيت الخدمة..." -ForegroundColor Yellow
    
    # Check if service already exists
    $existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-Host "⚠️ الخدمة موجودة بالفعل. سيتم حذفها وإعادة تثبيتها." -ForegroundColor Yellow
        Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
        & sc.exe delete $ServiceName
        Start-Sleep -Seconds 2
    }
    
    # Create the service
    $serviceCommand = "`"$NodePath`" `"$ScriptPath`""
    
    & sc.exe create $ServiceName binPath= $serviceCommand start= auto DisplayName= $ServiceDisplayName
    & sc.exe description $ServiceName $ServiceDescription
    
    # Configure service recovery
    & sc.exe failure $ServiceName reset= 0 actions= restart/5000/restart/10000/restart/30000
    
    Write-Host "✅ تم تثبيت الخدمة بنجاح!" -ForegroundColor Green
    Write-Host "   اسم الخدمة: $ServiceName" -ForegroundColor White
    Write-Host "   الوصف: $ServiceDisplayName" -ForegroundColor White
}

function Start-ServiceCustom {
    Write-Host "▶️ بدء تشغيل الخدمة..." -ForegroundColor Yellow
    Start-Service -Name $ServiceName
    
    $service = Get-Service -Name $ServiceName
    if ($service.Status -eq 'Running') {
        Write-Host "✅ تم تشغيل الخدمة بنجاح!" -ForegroundColor Green
        Write-Host "🌐 يمكن الوصول للنظام عبر: http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "❌ فشل في تشغيل الخدمة" -ForegroundColor Red
    }
}

function Stop-ServiceCustom {
    Write-Host "⏹️ إيقاف الخدمة..." -ForegroundColor Yellow
    Stop-Service -Name $ServiceName -Force
    Write-Host "✅ تم إيقاف الخدمة" -ForegroundColor Green
}

function Uninstall-Service {
    Write-Host "🗑️ إزالة الخدمة..." -ForegroundColor Yellow
    
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -eq 'Running') {
            Stop-Service -Name $ServiceName -Force
        }
        & sc.exe delete $ServiceName
        Write-Host "✅ تم إزالة الخدمة بنجاح!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ الخدمة غير موجودة" -ForegroundColor Yellow
    }
}

function Show-ServiceStatus {
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "📊 حالة الخدمة:" -ForegroundColor Cyan
        Write-Host "   الاسم: $($service.Name)" -ForegroundColor White
        Write-Host "   الحالة: $($service.Status)" -ForegroundColor White
        Write-Host "   نوع البدء: $($service.StartType)" -ForegroundColor White
        
        if ($service.Status -eq 'Running') {
            Write-Host "🌐 النظام متاح على: http://localhost:3000" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ الخدمة غير مثبتة" -ForegroundColor Red
    }
}

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ يجب تشغيل هذا السكريبت كمدير (Administrator)" -ForegroundColor Red
    Write-Host "   انقر بالزر الأيمن على PowerShell واختر 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 إدارة خدمة نظام إدارة التقارير العسكرية" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Gray

switch ($Action.ToLower()) {
    "install" {
        Install-Service
        Start-ServiceCustom
    }
    "start" {
        Start-ServiceCustom
    }
    "stop" {
        Stop-ServiceCustom
    }
    "restart" {
        Stop-ServiceCustom
        Start-Sleep -Seconds 2
        Start-ServiceCustom
    }
    "uninstall" {
        Uninstall-Service
    }
    "status" {
        Show-ServiceStatus
    }
    default {
        Write-Host "الاستخدام: .\install-service.ps1 [install|start|stop|restart|uninstall|status]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "الخيارات المتاحة:" -ForegroundColor Cyan
        Write-Host "  install   - تثبيت وتشغيل الخدمة" -ForegroundColor White
        Write-Host "  start     - تشغيل الخدمة" -ForegroundColor White
        Write-Host "  stop      - إيقاف الخدمة" -ForegroundColor White
        Write-Host "  restart   - إعادة تشغيل الخدمة" -ForegroundColor White
        Write-Host "  uninstall - إزالة الخدمة" -ForegroundColor White
        Write-Host "  status    - عرض حالة الخدمة" -ForegroundColor White
    }
}