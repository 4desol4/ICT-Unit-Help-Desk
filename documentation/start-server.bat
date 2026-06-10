@echo off
REM ICT Support Desk Server Startup Script
REM This script starts the backend and frontend in production mode
REM Requires Node.js and PostgreSQL to be installed and running

setlocal enabledelayedexpansion

cls
echo.
echo ====================================================
echo   ICT SUPPORT DESK - LOCAL SERVER (PRODUCTION)
echo ====================================================
echo.
echo Time: %date% %time%
echo.

REM Change to project root
cd /d "%~dp0"

REM ===== PRE-FLIGHT CHECKS =====
echo [CHECK] Verifying prerequisites...
echo.

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/ ^(LTS version^)
    echo.
    pause
    exit /b 1
)

REM Check if PostgreSQL is running
tasklist /FI "IMAGENAME eq postgres.exe" 2>nul | find /I /N "postgres.exe" >nul
if errorlevel 1 (
    echo [WARNING] PostgreSQL does not appear to be running
    echo Please ensure PostgreSQL service is started before continuing
    echo.
)

echo [OK] All checks passed
echo.
echo ====================================================
echo   STARTING SERVICES
echo ====================================================
echo.

REM ===== START BACKEND =====
echo [1/3] Starting backend server...
cd backend

REM Check dependencies
if not exist node_modules (
    echo [INFO] Installing backend dependencies...
    call npm install
    echo.
)

REM Run backend in production mode
start "ICT Backend Server - Port 5000" cmd /k npm run start

echo [OK] Backend started
echo.

REM Wait for backend to initialize
echo [2/3] Waiting 7 seconds for backend to initialize...
timeout /t 7 /nobreak

REM ===== START FRONTEND =====
echo [3/3] Starting frontend (production)...
cd ..\frontend

REM Check if build exists
if not exist dist (
    echo [INFO] Building frontend...
    call npm run build
    echo.
)

REM Check dependencies
if not exist node_modules (
    echo [INFO] Installing frontend dependencies...
    call npm install
    echo.
)

REM Start preview server (production build)
start "ICT Frontend Server - Port 3000" cmd /k npm run preview

echo [OK] Frontend started
echo.

REM ===== SUCCESS MESSAGE =====
cls
echo.
echo ====================================================
echo   ✅ APPLICATION STARTED SUCCESSFULLY
echo ====================================================
echo.
echo Services Running:
echo   - Backend API:  http://localhost:5000
echo   - Frontend Web: http://localhost:3000
echo.
echo Network Access:
echo   - From this PC:  http://localhost:3000
echo   - From network:  http://ict.local:3000
echo   - Or use IP:     http://192.168.1.50:3000
echo   ^(Replace 192.168.1.50 with your actual IP from ipconfig^)
echo.
echo Database:
echo   - Local:        ict_support_local ^(PostgreSQL^)
echo   - Cloud Sync:   Neon ^(Every 5 minutes^)
echo.
echo Log Windows:
echo   - Backend logs will appear in the "Backend" window
echo   - Frontend logs will appear in the "Frontend" window
echo.
echo To Stop:
echo   - Close either window to stop that service
echo   - Or press Ctrl+C in each window
echo.
echo ====================================================
echo.
pause
