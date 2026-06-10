@echo off
REM ICT Support Desk - Network & Hostname Configuration Helper
REM This script helps you set up the local network hostname and IP configuration

cls
echo.
echo ====================================================
echo   ICT SUPPORT DESK - NETWORK CONFIGURATION
echo ====================================================
echo.
echo This script will help you:
echo   1. Find your server PC's current IP address
echo   2. Set up ict.local hostname
echo   3. Configure CORS and client URLs
echo.
echo ====================================================
echo.

REM Get current IP
echo [1] Detecting your network IP address...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%a"
    set "ip=!ip:~1!"
)

if defined ip (
    echo   ✓ Found IP: %ip%
    echo.
    set "SERVER_IP=%ip%"
) else (
    echo   [ERROR] Could not detect IP address
    echo   Please run 'ipconfig' manually and note your IPv4 address
    echo.
    set /p SERVER_IP="Enter your server IP (e.g., 192.168.1.50): "
)

echo.
echo [2] Configuration Summary
echo.
echo   Server IP:      %SERVER_IP%
echo   Server Name:    ict.local (or ict-support-server.local)
echo   Backend Port:   5000
echo   Frontend Port:  3000 (production) or 5173 (development)
echo.
echo [3] Access URLs
echo.
echo   From this PC:
echo     - http://localhost:3000
echo     - http://localhost:5173 (dev)
echo.
echo   From other PCs on network:
echo     - http://%SERVER_IP%:3000
echo     - http://ict.local:3000
echo     - http://%SERVER_IP%:5173 (dev)
echo     - http://ict.local:5173 (dev)
echo.

echo [4] Updating backend configuration...
echo.

REM Read current .env
set "env_file=backend\.env"

if exist "%env_file%" (
    echo   ✓ Found backend\.env
    
    REM Create backup
    if not exist "backend\.env.backup" (
        copy "%env_file%" "backend\.env.backup" >nul
        echo   ✓ Backup created as backend\.env.backup
    )
    
    REM Check if already configured
    findstr /M "ict.local" "%env_file%" >nul
    if errorlevel 1 (
        echo   Updating CLIENT_URLS and CORS_ORIGIN...
        
        REM Update CLIENT_URLS (basic update - manual editing recommended)
        echo   Note: Please manually update backend\.env with these values:
        echo.
        echo   CLIENT_URLS=http://localhost:5173,http://%SERVER_IP%:5173,http://ict.local:5173,http://localhost:3000
        echo   CORS_ORIGIN=http://localhost:5173,http://%SERVER_IP%:5173,http://ict.local:5173,http://localhost:3000
        echo.
    ) else (
        echo   ✓ Already configured with ict.local
    )
) else (
    echo   [ERROR] backend\.env not found
    echo   Please create backend\.env first
)

echo.
echo [5] What to do next:
echo.
echo   A. Edit backend\.env manually:
echo      - Replace CLIENT_URLS with correct values
echo      - Ensure DATABASE_URL points to local PostgreSQL
echo      - Ensure NEON_DATABASE_URL is set for sync
echo.
echo   B. Verify Bonjour is installed:
echo      - Download from: https://support.apple.com/kb/DL999
echo      - Or install via iTunes/Apple software
echo      - Restart your PC after installation
echo.
echo   C. On CLIENT PCs, edit C:\Windows\System32\drivers\etc\hosts:
echo      - Add line: %SERVER_IP%  ict.local
echo      - Save the file
echo.
echo   D. Test network access from another PC:
echo      - Open browser: http://ict.local:3000
echo      - Should show ICT Support Desk login page
echo.

echo ====================================================
echo   NEXT STEPS
echo ====================================================
echo.
echo 1. Edit backend\.env and frontend\.env with correct URLs
echo 2. Ensure PostgreSQL is running
echo 3. Run: npm install in backend and frontend folders
echo 4. Run: npx prisma migrate deploy (in backend folder)
echo 5. Test with: .\start-server-dev.bat (for development)
echo 6. Setup auto-start: PowerShell -ExecutionPolicy Bypass -File setup-autostart.ps1
echo.

pause
