@echo off
REM ============================================================
REM ICT Support Desk - Local Mode Startup Script
REM Starts both backend and frontend for local network access
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  ICT Support Desk - Local Mode Startup                ║
echo ║  Both backend and frontend will run locally            ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if setup is complete
if not exist "backend\.env" (
    echo ❌ backend\.env not found!
    echo.
    echo Please run setup-local.bat first to configure.
    pause
    exit /b 1
)

if not exist "backend\node_modules" (
    echo ❌ Backend dependencies not installed!
    echo.
    echo Please run setup-local.bat first.
    pause
    exit /b 1
)

if not exist "frontend\node_modules" (
    echo ❌ Frontend dependencies not installed!
    echo.
    echo Please run setup-local.bat first.
    pause
    exit /b 1
)

REM Check PostgreSQL
echo Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL not running or not installed
    pause
    exit /b 1
)
echo ✅ PostgreSQL available

REM Get local IP
for /f "tokens=2 delims=: " %%a in ('ipconfig ^| findstr "IPv4 Address" ^| findstr -v "169\.254"') do (
    set "IP=%%a"
    goto :found_ip
)
:found_ip

echo.
echo ════════════════════════════════════════════════════════
echo Starting ICT Support Desk in LOCAL MODE...
echo ════════════════════════════════════════════════════════
echo.
echo Access the app at:
echo   - Local:    http://localhost:5173
echo   - Network:  http://%IP%:5173
echo   - mDNS:     http://ict.local:5173 (if Bonjour installed)
echo.
echo Backend API:  http://localhost:5000
echo Database sync will start automatically
echo.
echo Press Ctrl+C to stop both servers
echo ════════════════════════════════════════════════════════
echo.

REM Create startup directories if they don't exist
if not exist "logs" mkdir logs

REM Start backend in new window
echo Starting backend server (port 5000)...
start "ICT Support Desk - Backend" /D "backend" cmd /k "npm run dev"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
echo Starting frontend server (port 5173)...
start "ICT Support Desk - Frontend" /D "frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers started in new windows!
echo.
echo Backend: Look at "ICT Support Desk - Backend" window
echo Frontend: Look at "ICT Support Desk - Frontend" window
echo.
echo Press Enter to close this window (servers keep running)
pause
