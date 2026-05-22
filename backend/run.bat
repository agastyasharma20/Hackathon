@echo off
title BharatSync AI - FastAPI Backend
echo =====================================================================
echo           BharatSync AI - Enterprise Backend Bootstrap
echo =====================================================================
cd /d "%~dp0"

:: 1. Setup Virtual Environment
if not exist "venv" (
    echo [SYSTEM] Creating python virtual environment venv...
    python -m venv venv
)

echo [SYSTEM] Activating virtual environment...
call venv\Scripts\activate

:: 2. Install Packages
echo [SYSTEM] Installing Python backend dependencies...
pip install -r requirements.txt

:: 3. Run FastAPI Application
echo [SYSTEM] Booting Uvicorn server on http://localhost:8000 (hot reload active)...
uvicorn main:app --reload --port 8000
