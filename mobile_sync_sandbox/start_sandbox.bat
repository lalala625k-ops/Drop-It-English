@echo off
chcp 65001 >nul
title Drop-It English - Mobile Sync Sandbox

echo =======================================================
echo   🎨 Drop-It English - Mobile Sync Test Environment
echo =======================================================
echo.
echo [1/2] Starting the standalone service (Port: 8088)...
start "Note Mobile Sync Server" cmd /k "python mobile_sync_sandbox/server.py"

echo [2/2] Waiting for initialization and opening the test canvas...
timeout /t 2 /nobreak >nul
start http://localhost:8088/

echo.
echo =======================================================
echo   ✅ Service started!
echo   🖥️ Desktop canvas: http://localhost:8088/
echo   📂 Inbox folder: mobile_sync_sandbox\inbox_data\
echo =======================================================
pause
