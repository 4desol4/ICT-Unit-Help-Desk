@echo off
REM ICT Support Desk Server - Development Mode
REM Auto-reload on file changes using nodemon and Vite dev server

setlocal enabledelayedexpansion

cls
echo.
echo ====================================================
echo   ICT SUPPORT DESK - LOCAL SERVER ^(DEVELOPMENT^)
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
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if PostgreSQL is running
tasklist /FI "IMAGENAME eq postgres.exe" 2>nul | find /I /N "postgres.exe" >nul
if errorlevel 1 (
    echo [WARNING] PostgreSQL does not appear to be running
    echo Please ensure PostgreSQL service is started
    echo.
)

echo [OK] Prerequisites verified
echo.
echo ====================================================
echo   STARTING DEVELOPMENT MODE
echo ====================================================
echo.

REM ===== START BACKEND =====
echo [1/2] Starting backend server in development mode...
echo        ^(with auto-reload via nodemon^)
cd backend

REM Check dependencies
if not exist node_modules (
    echo [INFO] Installing backend dependencies...
    call npm install
    echo.
)

REM Run backend in development mode with auto-reload
start "ICT Backend - DEV (Port 5000)" cmd /k npm run dev

echo [OK] Backend started
echo.

REM Wait for backend to start
echo [WAIT] Giving backend 3 seconds to initialize...
timeout /t 3 /nobreak

REM ===== START FRONTEND =====
echo [2/2] Starting frontend in development mode...
echo        ^(with hot module reload^)
cd ..\frontend

REM Check dependencies
if not exist node_modules (
    echo [INFO] Installing frontend dependencies...
    call npm install
    echo.
)

REM Start Vite dev server
start "ICT Frontend - DEV (Port 5173)" cmd /k npm run dev

echo [OK] Frontend started
echo.

REM ===== SUCCESS MESSAGE =====
timeout /t 2 /nobreak
cls
echo.
echo ====================================================
echo   ✅ DEVELOPMENT MODE STARTED
echo ====================================================
echo.
echo Services Running:
echo   - Backend API:  http://localhost:5000
echo   - Frontend Web: http://localhost:5173
echo.
echo Network Access:
echo   - Local:        http://localhost:5173
echo   - Same Network: http://ict.local:5173
echo   - Or use IP:    http://192.168.1.50:5173
echo   ^(Replace IP with your actual server IP from: ipconfig^)
echo.
echo Development Features:
echo   - Backend:  Auto-reload on file changes ^(nodemon^)
echo   - Frontend: Hot Module Reload - changes appear instantly
echo.
echo Console Windows:
echo   - "Backend - DEV" window shows server logs and errors
echo   - "Frontend - DEV" window shows React/build output
echo.
echo To Stop:
echo   - Close either window, or press Ctrl+C
echo   - Or press Ctrl+C in each window
echo.
echo Database:
echo   - Local:  ict_support_local ^(PostgreSQL^)
echo   - Cloud:  Neon ^(syncs every 5 min^)
echo   - Status: Check "[DBSync]" messages in Backend window
echo.
echo Tips:
echo   - Check Backend window for database sync status
echo   - Frontend window shows Vite build warnings/errors
echo   - Edit files and changes appear immediately
echo.
echo ====================================================
echo.
pause
