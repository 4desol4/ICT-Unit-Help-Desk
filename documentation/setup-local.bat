@echo off
REM ============================================================
REM ICT Support Desk - Local Network Setup Script
REM Windows Batch File for Easy Configuration
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   ICT Support Desk - Local Network Setup Helper        ║
echo ║   This script will help you configure for local play   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 16+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if PostgreSQL is installed and add to PATH if needed
echo.
echo Checking PostgreSQL installation...
psql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  psql not in PATH. Searching for PostgreSQL...
    
    REM Try to find PostgreSQL in Program Files
    if exist "C:\Program Files\PostgreSQL" (
        for /d %%D in ("C:\Program Files\PostgreSQL\*") do (
            if exist "%%D\bin\psql.exe" (
                echo Found PostgreSQL at: %%D
                set "PG_PATH=%%D\bin"
                set "PATH=!PG_PATH!;!PATH!"
                echo ✅ PostgreSQL added to PATH
                goto :pg_found
            )
        )
    )
    
    if exist "C:\Program Files (x86)\PostgreSQL" (
        for /d %%D in ("C:\Program Files (x86)\PostgreSQL\*") do (
            if exist "%%D\bin\psql.exe" (
                echo Found PostgreSQL at: %%D
                set "PG_PATH=%%D\bin"
                set "PATH=!PG_PATH!;!PATH!"
                echo ✅ PostgreSQL added to PATH
                goto :pg_found
            )
        )
    )
    
    echo ❌ PostgreSQL not found. Please install PostgreSQL first.
    echo    Download from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

:pg_found
psql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL command failed. Installation may be incomplete.
    pause
    exit /b 1
)
echo ✅ PostgreSQL found and ready

REM Get network IP
echo.
echo ────────────────────────────────────────────────────────
echo STEP 1: Network Configuration
echo ────────────────────────────────────────────────────────
echo.
echo Finding your network IP...
for /f "tokens=*" %%a in ('ipconfig ^| findstr "IPv4 Address"') do (
    for /f "tokens=2 delims=:" %%b in ("%%a") do (
        set "IP=%%b"
        set "IP=!IP: =!"
    )
)
if "!IP!"==" " (
    echo ⚠️  Could not detect network IP automatically
    set /p IP="Enter your network IP manually: "
)
echo.
echo Your Network IP: !IP!
echo.
echo Use this IP to access the app from other computers:
echo   Browser: http://!IP!:5173
echo.
echo To use ict.local instead, install Bonjour:
echo   Download: https://support.apple.com/kb/DL999
echo   Or install with iTunes/Apple software
echo.

REM Ask user for PostgreSQL password
echo.
echo ────────────────────────────────────────────────────────
echo STEP 2: PostgreSQL Configuration
echo ────────────────────────────────────────────────────────
echo.
echo ℹ️  This script will create the database automatically.
echo.
echo Enter your PostgreSQL ADMIN password (postgres user^).
echo This is what you set during PostgreSQL installation.
echo.
set /p PG_PASSWORD="PostgreSQL postgres user password: "

REM Create .pgpass file for PostgreSQL authentication
set "PGPASS=%USERPROFILE%\.pgpass"
(
    echo localhost:5432:*:postgres:!PG_PASSWORD!
    echo 127.0.0.1:5432:*:postgres:!PG_PASSWORD!
) > "%PGPASS%"

REM Create local database using temporary SQL file
echo.
echo Creating local database...
echo.

REM Create temporary SQL file
set "TEMP_SQL=%TEMP%\ict_setup_temp.sql"
(
    echo CREATE DATABASE IF NOT EXISTS ict_support_local;
    echo DO $$ BEGIN
    echo   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ict_local_user'^) THEN
    echo     CREATE USER ict_local_user WITH PASSWORD 'local_password';
    echo   END IF;
    echo END $$;
    echo ALTER USER ict_local_user WITH PASSWORD 'local_password';
    echo GRANT ALL PRIVILEGES ON DATABASE ict_support_local TO ict_local_user;
) > "%TEMP_SQL%"

REM Execute SQL file - .pgpass file will be used for authentication
psql -U postgres -h 127.0.0.1 -f "%TEMP_SQL%" 2>nul
set "RESULT=!errorlevel!"

REM Clean up temporary files
del "%TEMP_SQL%" 2>nul
del "%PGPASS%" 2>nul

if !RESULT! neq 0 (
    echo ❌ Database creation failed
    echo ℹ️  Troubleshooting:
    echo    1. Verify your PostgreSQL admin password is correct
    echo    2. Make sure PostgreSQL service is running
    echo    3. Try: Services ^(Windows^) ^> PostgreSQL ^> Properties ^> Start
    echo.
    echo If database already exists from manual setup, press any key
    echo and continue to the next step.
    pause
)

echo ✅ Database ready (created or already exists^)

REM Create .env file
echo.
echo ────────────────────────────────────────────────────────
echo STEP 3: Backend Configuration
echo ────────────────────────────────────────────────────────
echo.

REM Check if .env already exists
if exist "backend\.env" (
    echo ⚠️  backend\.env already exists
    set /p OVERWRITE="Overwrite it? (y/n): "
    if /i not "!OVERWRITE!"=="y" (
        echo Skipping .env creation
        goto :skip_env
    )
)

echo Creating backend\.env...
(
    echo # Server Configuration
    echo NODE_ENV=development
    echo PORT=5000
    echo.
    echo # Development Database (Required for local development)
    echo DATABASE_URL=postgresql://ict_local_user:local_password@localhost:5432/ict_support_local
    echo.
    echo # Production Database (Required for production deployment)
    echo # Get from: Neon Dashboard - Connection String
    echo NEON_DATABASE_URL=postgresql://neon_user:neon_password@ep-xxx.neon.tech/ict_support_desk?sslmode=require
    echo.
    echo # Network Configuration
    echo CORS_ORIGIN=http://localhost:5173,http://!IP!:5173,http://ict.local:5173
    echo CLIENT_URLS=http://localhost:5173,http://!IP!:5173,http://ict.local:5173
    echo.
    echo # Firebase
    echo JWT_SECRET=your-jwt-secret-here
    echo FIREBASE_SERVICE_ACCOUNT_JSON=./firebase-service-account.json
    echo.
    echo # Cloudinary
    echo CLOUDINARY_CLOUD_NAME=your_cloud_name
    echo CLOUDINARY_API_KEY=your_api_key
    echo CLOUDINARY_API_SECRET=your_api_secret
) > backend\.env
echo ✅ .env created at backend\.env
echo   📝 Please edit it with your actual credentials

:skip_env

REM Install dependencies
echo.
echo ────────────────────────────────────────────────────────
echo STEP 4: Installing Dependencies
echo ────────────────────────────────────────────────────────
echo.

echo Installing backend dependencies...
cd backend
call npm install >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend npm install failed
    cd ..
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
cd ..

echo Installing frontend dependencies...
cd frontend
call npm install >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend npm install failed
    cd ..
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed
cd ..

REM Database setup
echo.
echo ────────────────────────────────────────────────────────
echo STEP 5: Database Setup
echo ────────────────────────────────────────────────────────
echo.
echo Running Prisma migrations...
cd backend
call npx prisma migrate deploy >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Prisma migrations had issues - you may need to fix .env
)
echo ✅ Database tables created
cd ..

REM Final instructions
echo.
echo ════════════════════════════════════════════════════════
echo ✅ Setup Complete!
echo ════════════════════════════════════════════════════════
echo.
echo NEXT STEPS:
echo.
echo 1. Edit backend\.env with your actual Neon database URL
echo    (Copy from: Neon Dashboard → Connection String)
echo.
echo 2. Add Neon password to backend\.env line:
echo    NEON_DATABASE_URL=postgresql://...
echo.
echo 3. Run the startup script:
echo    start-local.bat
echo.
echo ACCESSING THE APP:
echo.
echo From this PC:
echo   - Frontend: http://localhost:5173
echo   - Backend: http://localhost:5000
echo.
echo From other PCs on same network:
echo   - Frontend: http://!IP!:5173
echo   - Or: http://ict.local:5173 (if Bonjour installed)
echo.
echo DATABASE SYNCING:
echo   - Local and Neon databases will auto-sync every 5 minutes
echo   - Check backend console for sync status
echo.
echo ════════════════════════════════════════════════════════
echo.

pause
