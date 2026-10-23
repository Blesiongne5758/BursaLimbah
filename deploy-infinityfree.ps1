# ============================================
# DEPLOYMENT SCRIPT - INFINITYFREE FTP
# ============================================
# Credentials:
# Host: ftpupload.net
# Username: if0_43249513
# Password: N0m4d3n0
# Target: htdocs/

Write-Host "======================================" -ForegroundColor Green
Write-Host "BursaLimbah Deployment Script" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# FTP Credentials
$ftpHost = "ftpupload.net"
$ftpUser = "if0_43249513"
$ftpPass = "N0m4d3n0"
$ftpPath = "/htdocs/"

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: dist folder not found!" -ForegroundColor Red
    Write-Host "Please run 'npm run build' first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Build folder found" -ForegroundColor Green
Write-Host ""

# Method 1: Using WinSCP (if installed)
$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.exe"
if (Test-Path $winscpPath) {
    Write-Host "📤 Uploading via WinSCP..." -ForegroundColor Cyan
    
    $script = @"
open ftp://$ftpUser`:$ftpPass@$ftpHost/
cd $ftpPath
put -r dist\* .
close
exit
"@
    
    $script | Out-File -FilePath "winscp_script.txt" -Encoding ASCII
    
    Start-Process -FilePath $winscpPath -ArgumentList "/script=winscp_script.txt" -Wait
    
    Remove-Item "winscp_script.txt"
    Write-Host "✅ Upload complete via WinSCP!" -ForegroundColor Green
    exit 0
}

# Method 2: Using built-in FTP (Windows)
Write-Host "📤 Using Windows FTP client..." -ForegroundColor Cyan

$ftpScript = @"
open $ftpHost
$ftpUser
$ftpPass
binary
cd $ftpPath
lcd dist
prompt
mput *
bye
"@

$ftpScript | Out-File -FilePath "ftp_script.txt" -Encoding ASCII

try {
    ftp -s:ftp_script.txt
    Remove-Item "ftp_script.txt"
    Write-Host "✅ Upload complete!" -ForegroundColor Green
} catch {
    Write-Host "❌ FTP upload failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative methods:" -ForegroundColor Yellow
    Write-Host "1. Use FileZilla (recommended)" -ForegroundColor White
    Write-Host "2. Use WinSCP" -ForegroundColor White
    Write-Host "3. Use InfinityFree File Manager" -ForegroundColor White
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Website: https://your-domain.infinityfreeapp.com" -ForegroundColor Cyan
Write-Host ""
