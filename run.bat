@echo off
title BharatSync AI - Control Panel
echo =====================================================================
echo                BharatSync AI - Unified Bootloader
echo =====================================================================
echo.
echo [SYSTEM] Starting FastAPI Backend Service...
start "BharatSync AI - Backend" cmd /c "cd backend && run.bat"

echo [SYSTEM] Starting Next.js Frontend App...
start "BharatSync AI - Frontend" cmd /c "cd frontend && run.bat"

echo.
echo =====================================================================
echo BharatSync AI services are launching in separate consoles!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo =====================================================================
pause
