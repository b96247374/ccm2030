# إنشاء اختصار سطح المكتب لنظام إدارة التقارير العسكرية

$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = $WshShell.SpecialFolders("Desktop")
$CurrentPath = Get-Location
$ShortcutPath = "$DesktopPath\نظام إدارة التقارير العسكرية.lnk"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "cmd.exe"
$Shortcut.Arguments = "/c `"cd /d `"$CurrentPath`" && `"بدء-سريع.bat`"`""
$Shortcut.WorkingDirectory = $CurrentPath
$Shortcut.Description = "نظام إدارة التقارير العسكرية المطور"
$Shortcut.IconLocation = "shell32.dll,1"
$Shortcut.Save()

Write-Host "✅ تم إنشاء اختصار على سطح المكتب!" -ForegroundColor Green
Write-Host "📱 يمكنك الآن النقر مرتين على الاختصار لتشغيل النظام" -ForegroundColor Cyan

# إنشاء اختصار للمتصفح أيضاً
$BrowserShortcutPath = "$DesktopPath\فتح نظام التقارير.lnk"
$BrowserShortcut = $WshShell.CreateShortcut($BrowserShortcutPath)
$BrowserShortcut.TargetPath = "http://localhost:3000"
$BrowserShortcut.Description = "فتح نظام إدارة التقارير العسكرية في المتصفح"
$BrowserShortcut.IconLocation = "shell32.dll,14"
$BrowserShortcut.Save()

Write-Host "✅ تم إنشاء اختصار للمتصفح أيضاً!" -ForegroundColor Green