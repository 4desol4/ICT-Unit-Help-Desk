@echo off
REM ICT Support Desk - Setup Verification Script
REM Checks if your PC is ready for server setup

setlocal enabledelayedexpansion

cls
echo.
echo ====================================================
echo   ICT SUPPORT DESK - SETUP VERIFICATION
echo ====================================================
echo.
echo This script checks if your PC is ready for setup
echo.

set "checks_passed=0"
set "checks_failed=0"

REM ===== CHECK 1: Node.js =====
echo [1/7] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo   [FAIL] Node.js not found
    echo   FIX: Download from https://nodejs.org/ ^(LTS version^)
    set /a checks_failed=!checks_failed!+1
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VER=%%i
    echo   [PASS] Found !NODE_VER!
    set /a checks_passed=!checks_passed!+1
)
echo.

REM ===== CHECK 2: NPM =====
echo [2/7] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo   [FAIL] npm not found
    set /a checks_failed=!checks_failed!+1
) else (
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VER=%%i
    echo   [PASS] Found version !NPM_VER!
    set /a checks_passed=!checks_passed!+1
)
echo.

REM ===== CHECK 3: PostgreSQL =====
echo [3/7] Checking PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo   [FAIL] PostgreSQL not found or not in PATH
    echo   FIX: Download from https://postgresql.org/download/windows/
    set /a checks_failed=!checks_failed!+1
) else (
    for /f "tokens=*" %%i in ('psql --version 2^>nul') do set PG_VER=%%i
    echo   [PASS] Found !PG_VER!
    set /a checks_passed=!checks_passed!+1
)
echo.

REM ===== CHECK 4: Project Files =====
echo [4/7] Checking project files...
if exist "backend\package.json" (
    echo   [PASS] backend/package.json found
    set /a checks_passed=!checks_passed!+1
) else (
    echo   [FAIL] backend/package.json not found
    set /a checks_failed=!checks_failed!+1
)
echo.

REM ===== CHECK 5: .env File =====
echo [5/7] Checking backend configuration...
if exist "backend\.env" (
    echo   [PASS] backend/.env found
    set /a checks_passed=!checks_passed!+1
    
    REM Check if .env has database config
    findstr /M "DATABASE_URL" "backend\.env" >nul 2>&1
    if errorlevel 1 (
        echo   [WARN] DATABASE_URL not found in backend/.env
        echo         FIX: Add DATABASE_URL=postgresql://...
    ) else (
        echo   [PASS] DATABASE_URL configured
    )
) else (
    echo   [WARN] backend/.env not found yet
    echo         HINT: Will be created during setup
    set /a checks_passed=!checks_passed!+1
)
echo.

REM ===== CHECK 6: Startup Scripts =====
echo [6/7] Checking startup scripts...
if exist "start-server.bat" (
    echo   [PASS] start-server.bat found
    set /a checks_passed=!checks_passed!+1
) else (
    echo   [FAIL] start-server.bat not found
    set /a checks_failed=!checks_failed!+1
)
echo.

REM ===== CHECK 7: Network Configuration =====
echo [7/7] Checking network configuration...
echo   Detecting network IP...
set "found_ip=0"
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%a"
    set "ip=!ip:~1!"
    if !found_ip! equ 0 (
        echo   [PASS] Found IP: !ip!
        set "found_ip=1"
    )
    set /a checks_passed=!checks_passed!+1
)
if !found_ip! equ 0 (
    echo   [WARN] Could not detect IP
    echo          This is usually fine - will be detected during setup
    set /a checks_passed=!checks_passed!+1
)
echo.

REM ===== SUMMARY =====
cls
echo.
echo ====================================================
echo   VERIFICATION RESULTS
echo ====================================================
echo.
echo Passed: !checks_passed!
echo Failed: !checks_failed!
echo.

if !checks_failed! gtr 0 (
    echo [WARNING] Some prerequisites are missing
    echo.
    echo Required software:
    echo   1. Node.js 18+ - https://nodejs.org/
    echo   2. PostgreSQL 15+ - https://postgresql.org/download/windows/
    echo   3. Bonjour - https://support.apple.com/kb/DL999
    echo.
    echo Please install the missing software and restart this PC
    echo Then run this script again
    echo.
) else (
    echo [SUCCESS] All prerequisites are installed!
    echo.
    echo You're ready to proceed with setup.
    echo Next: Open SETUP_WALKTHROUGH.md to get started
    echo.
)

echo ====================================================
echo.
pause
