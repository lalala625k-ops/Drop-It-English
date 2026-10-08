﻿param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [string]$ReleaseDir
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

Write-Host "=== Drop-It English 0.1 · Windows Installer and Portable Build ===" -ForegroundColor Cyan
Write-Host "User data is separate from build inputs (stored in %LOCALAPPDATA%\DropItEnglish\data)." -ForegroundColor Gray

if (-not $SkipFrontend) {
    Write-Host "`n[1/4] Building frontend (Vite)…" -ForegroundColor Yellow
    Push-Location (Join-Path $root 'frontend')
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed' }
    } finally { Pop-Location }
}

$backendExe = Join-Path $root 'backend\dist\pinboard-service.exe'
if ($SkipBackend -and (Test-Path $backendExe)) {
    Write-Host "`n[2/4] Using existing local service executable…" -ForegroundColor Green
} else {
    Write-Host "`n[2/4] Building frozen local service…" -ForegroundColor Yellow
    Push-Location $root
    try {
        python -m PyInstaller --noconfirm --clean --onefile --name pinboard-service `
            --paths $root `
            --additional-hooks-dir scripts/pyinstaller_hooks `
            --collect-all rapidocr_onnxruntime `
            --collect-binaries onnxruntime `
            --collect-data onnxruntime `
            --exclude-module torch `
            --exclude-module torchvision `
            --exclude-module torchaudio `
            --exclude-module scipy `
            --exclude-module numba `
            --exclude-module llvmlite `
            --exclude-module PIL._avif `
            --exclude-module PIL.AvifImagePlugin `
            --add-data "frontend/dist;web" `
            --add-data "backend/locale;locale" `
            --distpath backend/dist `
            backend/desktop_server.py
        if ($LASTEXITCODE -ne 0) { throw 'Service build failed' }
    } finally { Pop-Location }
}

Write-Host "`n[3/4] Building desktop launcher (Edge WebView2)…" -ForegroundColor Yellow
Push-Location $root
try {
    python -m PyInstaller --noconfirm --clean --onefile --name DropIt `
        --paths $root `
        --icon desktop/icons/icon.ico `
        --version-file desktop/windows_version.txt `
        --add-data "backend/locale;locale" `
        --collect-all webview `
        --hidden-import webview.platforms.edgechromium `
        --exclude-module webview.platforms.cef `
        --exclude-module webview.platforms.gtk `
        --exclude-module webview.platforms.qt `
        --exclude-module webview.platforms.cocoa `
        --exclude-module webview.platforms.android `
        --distpath desktop/dist `
        --workpath build/launcher `
        desktop/app.py
    if ($LASTEXITCODE -ne 0) { throw 'Launcher build failed' }
} finally { Pop-Location }

Write-Host "`n[4/4] Assembling Drop-It English portable and installer…" -ForegroundColor Yellow
Push-Location $root
try {
    if ($ReleaseDir) {
        python scripts\build_dropit_installer.py --release-dir $ReleaseDir
    } else {
        python scripts\build_dropit_installer.py
    }
    if ($LASTEXITCODE -ne 0) { throw 'Installer packaging failed' }
} finally { Pop-Location }

$outputDir = if ($ReleaseDir) { $ReleaseDir } else { Join-Path $root 'release' }
Write-Host "`n=== Build complete! Installer: $(Join-Path $outputDir 'Drop-It-English-Setup-0.1.exe') ===" -ForegroundColor Green
Write-Host "Portable folder: $(Join-Path $outputDir 'Drop-It English 0.1')" -ForegroundColor Green
