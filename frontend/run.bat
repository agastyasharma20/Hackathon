@echo off
title BharatSync AI - Next.js Frontend
echo =====================================================================
echo           BharatSync AI - Enterprise Frontend Bootstrap
echo =====================================================================
cd /d "%~dp0"

:: 1. Install Node Dependencies
echo [SYSTEM] Checking Node modules...
if not exist "node_modules" (
    echo [SYSTEM] Installing Node dependencies...
    call npm install
)

:: 2. Start Next.js Development Server
echo [SYSTEM] Booting Next.js server on http://localhost:3000...
call npm run dev
