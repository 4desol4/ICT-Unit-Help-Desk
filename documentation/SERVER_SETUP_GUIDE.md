# 🖥️ Server PC Setup Guide - Complete Step-by-Step

**Goal:** Configure a Windows PC as a dedicated server for ICT Support Desk that:

- ✅ Runs the application on PC startup automatically
- ✅ Accessible via `ict.local` from any device on the network
- ✅ Syncs database bidirectionally with Neon (online/offline mode)
- ✅ Serves the app to all staff on the Wi-Fi network

**Estimated Time:** 45-60 minutes (first time only)

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Node.js 18+** - https://nodejs.org/ (download LTS version)
2. **PostgreSQL 15+** - https://www.postgresql.org/download/windows/
3. **Bonjour for Windows** - https://support.apple.com/kb/DL999 (for `ict.local` hostname)
4. **Administrator Access** on the server PC
5. **Static IP or DHCP Reservation** on your network

### Verify Installations

Open PowerShell and run:

```powershell
node --version
npm --version
psql --version
```

All should show version numbers (not "command not found").

---

## 🔧 STEP 1: Configure Local PostgreSQL Database

This database will be the primary database when running locally and will sync with Neon.

### Step 1.1: Create Local Database & User

Open **PowerShell as Administrator** and run:

```powershell
psql -U postgres -c "CREATE DATABASE ict_support_local;"
psql -U postgres -c "CREATE USER ict_local_user WITH PASSWORD 'ict_local_secure_2024';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ict_support_local TO ict_local_user;"
```

When prompted, enter your PostgreSQL `postgres` user password (set during PostgreSQL installation).

### Step 1.2: Verify Database Creation

```powershell
psql -U ict_local_user -d ict_support_local -c "\dt"
```

You should see "No relations found" (that's fine - tables will be created by Prisma migrations).

---

## 🌐 STEP 2: Find & Assign Static IP Address

### Step 2.1: Find Your Current IP

```powershell
# In PowerShell, run:
ipconfig

# Look for IPv4 Address under your active network adapter
# Example output:
# IPv4 Address. . . . . . . . . : 192.168.1.50
```

**Note down your IP address** (e.g., `192.168.1.50`)

### Step 2.2: Make IP Static (Recommended)

**Option A: Via Router (Best)**

1. Log into your router's admin panel (usually `192.168.1.1` or `192.168.0.1`)
2. Find "DHCP Reservation" or "Static IP Binding"
3. Enter your PC's MAC address and assign it your current IP address
4. Save and restart your PC's network connection

**Option B: Via Windows Network Settings**

1. Open **Settings → Network & Internet → Wi-Fi** (or Ethernet)
2. Click "Change adapter options"
3. Right-click your network → **Properties**
4. Select **IPv4** → **Properties**
5. Choose "Use the following IP address"
6. Enter:
   - IP Address: Your current IP (e.g., `192.168.1.50`)
   - Subnet Mask: `255.255.255.0`
   - Default Gateway: Your router IP (usually `192.168.1.1`)
   - DNS: `8.8.8.8` and `8.8.4.4`
7. Click OK and close

---

## 🏠 STEP 3: Set Up `ict.local` Hostname

### Step 3.1: Install Bonjour

1. Download: https://support.apple.com/kb/DL999
2. Run installer and complete installation
3. **Restart your PC**

### Step 3.2: Rename Your Computer (Optional but Recommended)

For easy hostname management:

1. Right-click **This PC** → **Properties**
2. Click **"Rename this PC"**
3. Rename to: `ict-support-server` (or preferred name)
4. Click **Next** → **Restart Now**

After restart, your computer is accessible as `ict-support-server.local`

### Step 3.3: Create Alias for ict.local (On All Client PCs)

On **each client PC** that needs to access the server:

1. Open **Notepad as Administrator**
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add this line at the end:
   ```
   192.168.1.50  ict.local
   ```
   (Replace `192.168.1.50` with your actual server IP)
4. Save and close

**Test from client PC:**

```powershell
ping ict.local
# Should respond from your server IP
```

---

## 📁 STEP 4: Configure Backend Environment

### Step 4.1: Update `backend/.env`

Navigate to your project folder and edit `backend/.env`:

```env
# ========================================
# SERVER CONFIGURATION
# ========================================
NODE_ENV=development
PORT=5000

# ========================================
# DATABASE CONFIGURATION
# ========================================

# LOCAL DATABASE (Primary when running locally)
DATABASE_URL=postgresql://ict_local_user:ict_local_secure_2024@localhost:5432/ict_support_local

# NEON DATABASE (Cloud - For sync and production fallback)
NEON_DATABASE_URL=postgresql://neondb_owner:npg_h7PueV2zTMaq@ep-divine-surf-apxxjnjl.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require

# ========================================
# NETWORK CONFIGURATION
# ========================================

# Allow frontend to connect from multiple sources
CLIENT_URLS=http://localhost:5173,http://192.168.1.50:5173,http://ict.local:5173,http://localhost:3000

# CORS origins (same as CLIENT_URLS)
CORS_ORIGIN=http://localhost:5173,http://192.168.1.50:5173,http://ict.local:5173,http://localhost:3000

# ========================================
# DATABASE SYNC (Bidirectional)
# ========================================

# Enable automatic syncing between local and Neon
SYNC_ENABLED=true
SYNC_INTERVAL=300000        # Sync every 5 minutes (in milliseconds)
SYNC_MODE=bidirectional     # Options: pull, push, bidirectional
AUTO_SYNC=true              # Auto-start sync on server startup

# ========================================
# FIREBASE & SERVICES
# ========================================

JWT_SECRET=ict_desk_super_secret_2024
FIREBASE_SERVICE_ACCOUNT_JSON=./utils/service-account.json
FIREBASE_PROJECT_ID=ict-helpdesk-e983c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ict-helpdesk-e983c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCfkUEygYXvA6g9\n+mk4vjDClvYC1R97cPCEKu8wmQNTZ3DTiH12kKpVznvC35xevkN63m07eVh87V+0\n0T7S9n1R2ohxhd7beLRfCzOmv+uaB9AANmhke74YTOCNzxCA/VvWhiZE0AaAFOFg\n906ilLAKeEjKEBQVYbvOiNMGroIPSVBUBozw0/v4wmVCgIk9F5Rz1uSJj88Nm192\nFb4X/w1eUa3fZffH5tQrtdHKIS1rbVMq5zVLN8gWVgaR7lx20uBQJdpHEWVOuynN\nEhZlE9e1nAWC9NfX/6aUbHDbThE3Mp97jtBHRHzePmXACHpiNRAnbA/cgQV5omnm\nOpGCCY9VAgMBAAECggEAHRx+hQzdVwRXSutnC/ui4LVy74RbaIVr0+kTV03rLem2\ny1jg7uMouFvh92UdXamfnQh8bDfQvYX/CnmMWSewKGFSuEdgp7DHU3mzNC5aePEI\n8Sj79a0fusY3x5dp3uaaPTKfQ7miHfbxQWQNHBs9XMOiH/878sSwY1dSDKuEve3r\n5wblxxq0Yj08iqLxJFNtWyrX7pg6FcOdHPGBsOUxoz6Pd7DcoghBvonFzLNKYiho\nAxfA/MAuYKPGvcpbyCZyDJEAo3Fbz6ZslkrG+pMHdw/46JB8m/8icTkhcJEorPcX\nmFEV0/d0lKtJlfeIcPy86c5DP54WPTlsJv2w2HIr8QKBgQDRcKvuCaxB60koh2u1\nc6Q1yygSahdq6R/dxWHz3wlpijotphnvIfzfK2m/pTg3T+TW+2TllbQjciOlTqey\nCZPQeTz5cUXFAN1zc4XvqiVJk6wge9l+o4kAFZX+/At47Pw599fjn6bKZl1f6gck\nEbrMOyD5Eo/kvPZUag7G96OoDQKBgQDDCk4GSSHOkMYNv0c7wLPrfMaFRQhKUjOG\nj1zmw/DB7wBJcEM3W7zvQbfK9syydfTBsj0TzRWGHPu94pe/WFVr3Q2zYYB9Xzxr\nJmDSCBuBs5jcGT6AYyfRCsRyB0kpsGE6VKDFjqfNVhsl53PdxTIPHKrm36q12M1/\nlAE6zlWqaQKBgQC4eZKmlxSH93M35JfleldQHoJMPfAkdfRghWPyxyhmMp9t59j9\n/aTa+UUqzZ9HcPKyvTmw0vyZIAbvqukgczkkLjWbzL7UeB+WelGluOsg9JZvAkef\nOPIKBflZX63HNI4xjPE2iEAEFMf4HI1vosIy833mhQgDRMF/tu8PJ76Z3QKBgA5F\n5sfW+j5fod7HrLLWu1P0YaLHFoA528NxIl9Q34GRt/en24Nll0H7ETQtM3Wr5Cl4\nnbehPn3+CP4wYuKB2F54YtRJwllqasV8nYFBTqIDPqB8yHIkz3kgzJd7qQMAAV1/\na/SJKAaC0qHHelc0YyFv+6HBpICCSSeY8S4Yg3RhAoGBALZ+E0674ltaDRemPrV2\nXnqthdvqcjWPwj7iX7HxIWt36wqICguRgzviUhK9vx5QbRtZJAYuNvPQ1VFyYGok\nATnnJMF8plw+dTurqzVRERulPt1hvqVCO5V4VXi2JCxAZvNUu+9R6+7w+HmSgSne\nOBEsoCjYg4jyAaxwHcdQhqq0\n-----END PRIVATE KEY-----\n

CLOUDINARY_CLOUD_NAME=dpgx5dvyr
CLOUDINARY_API_KEY=436475286928488
CLOUDINARY_API_SECRET=WXz2JnNPW3vrQqhnJiP_W2Ge1GM
```

---

## 🗄️ STEP 5: Set Up Database Migrations

### Step 5.1: Run Prisma Migrations

```powershell
cd "C:\Users\sola\Desktop\ICT Support Desk\backend"
npm install
npx prisma migrate deploy
```

This creates all tables in your local PostgreSQL database.

### Step 5.2: Verify Database Schema

```powershell
npx prisma studio
```

This opens Prisma Studio in your browser. You should see all the tables created.

---

## 🔄 STEP 6: Configure Bidirectional Database Sync

The application has automatic sync built-in. The sync will:

- **Pull** new data from Neon every 5 minutes when offline
- **Push** changes to Neon when internet is available
- **Detect** connection changes and sync immediately

### Configuration Options in `backend/.env`:

```env
SYNC_ENABLED=true           # Enable/disable sync
SYNC_INTERVAL=300000        # Milliseconds (300000 = 5 minutes)
SYNC_MODE=bidirectional     # pull, push, or bidirectional
AUTO_SYNC=true              # Auto-start on server startup
```

### How It Works:

1. **Offline Mode:** All data reads/writes go to local PostgreSQL
2. **Online Mode:** Changes are synced to Neon automatically
3. **Reconnection:** When internet returns, full sync happens
4. **Sync Logs:** Check server console for sync status messages

---

## 🚀 STEP 7: Create Production Startup Scripts

### Step 7.1: Create Main Startup Script

Create file: `start-server.bat`

```batch
@echo off
REM ICT Support Desk Server Startup Script
REM This script starts the backend and frontend in production mode

setlocal enabledelayedexpansion

echo.
echo ====================================================
echo   ICT SUPPORT DESK - LOCAL SERVER
echo ====================================================
echo.

REM Change to project root
cd /d "%~dp0"

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PostgreSQL is running
tasklist /FI "IMAGENAME eq postgres.exe" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] PostgreSQL does not appear to be running
    echo Please start PostgreSQL service before continuing
    pause
)

echo [1/4] Starting backend server...
cd backend
start "ICT Backend Server" cmd /k npm run start

echo [2/4] Waiting for backend to start...
timeout /t 5 /nobreak

echo [3/4] Starting frontend...
cd ../frontend
start "ICT Frontend Server" cmd /k npm run preview

echo.
echo ====================================================
echo   ✅ APPLICATION STARTED
echo ====================================================
echo.
echo Access the application at:
echo   - Local:    http://localhost:3000
echo   - Network:  http://ict.local:3000
echo.
echo Press any key to continue...
echo.
pause
```

### Step 7.2: Create Development Startup Script

Create file: `start-server-dev.bat`

```batch
@echo off
REM ICT Support Desk Server - Development Mode
REM Auto-reload on file changes

setlocal enabledelayedexpansion

echo.
echo ====================================================
echo   ICT SUPPORT DESK - LOCAL SERVER (DEV MODE)
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting backend in development mode...
cd backend
start "ICT Backend - DEV" cmd /k npm run dev

echo [2/2] Starting frontend in development mode...
cd ../frontend
timeout /t 3 /nobreak
start "ICT Frontend - DEV" cmd /k npm run dev

echo.
echo ====================================================
echo   ✅ DEVELOPMENT MODE STARTED
echo ====================================================
echo.
echo Access the application at:
echo   - Local:    http://localhost:5173
echo   - Network:  http://192.168.1.50:5173 (or http://ict.local:5173)
echo.
```

---

## ⚙️ STEP 8: Configure Auto-Start on Boot

### Step 8.1: Create Startup Task (Windows Task Scheduler)

1. Open **Task Scheduler** (search in Start menu)
2. Click **"Create Task"** on the right panel
3. Fill in:
   - **Name:** `ICT Support Desk - Autostart`
   - **Description:** `Automatically starts ICT Support Desk application`
   - Check: **"Run with highest privileges"**

4. Go to **Triggers** tab → Click **"New..."**
   - **Begin the task:** At startup
   - Click OK

5. Go to **Actions** tab → Click **"New..."**
   - **Action:** Start a program
   - **Program/script:**
     ```
     C:\Users\sola\Desktop\ICT Support Desk\start-server.bat
     ```
   - **Start in:**
     ```
     C:\Users\sola\Desktop\ICT Support Desk
     ```
   - Click OK

6. Go to **Conditions** tab:
   - Uncheck: **"Start the task only if the computer is on AC power"**
   - Check: **"Wake the computer to run this task"**
   - Click OK

7. Click **OK** at the bottom to save the task

### Step 8.2: Test Auto-Start Task

```powershell
# Open PowerShell as Administrator and run:
Start-ScheduledTask -TaskName "ICT Support Desk - Autostart"

# Or trigger it manually from Task Scheduler
```

### Step 8.3: Create Alternative - Startup Folder Method

For simpler setup, create a shortcut in the Startup folder:

1. Press `Win + R`
2. Type: `shell:startup`
3. Create a **New Shortcut** in the opened folder
4. Shortcut location:
   ```
   C:\Users\sola\Desktop\ICT Support Desk\start-server.bat
   ```
5. Name it: `ICT Support Desk Server`
6. Right-click → **Properties** → **Advanced** → Check **"Run as administrator"**
7. Click OK

Now it will start whenever you log in.

---

## 🧪 STEP 9: Testing & Verification

### Test 1: Verify Backend Connectivity

From your server PC, run:

```powershell
curl http://localhost:5000
# Should respond with: {"message":"ICT Support Desk API running ✅"}
```

### Test 2: Verify Frontend Accessibility

From the server PC:

- Open browser to: `http://localhost:5173` or `http://localhost:3000`

### Test 3: Verify Network Access (From Another PC on Same Wi-Fi)

On a **different device** on the same network:

```powershell
# Test backend
curl http://192.168.1.50:5000
# or
curl http://ict.local:5000

# Open browser
http://ict.local:5173  (or http://192.168.1.50:5173)
```

### Test 4: Verify Database Sync

With backend running:

1. Check server console for sync messages:

   ```
   [DBSync] Starting sync cycle...
   [DBSync] Pull sync completed
   ```

2. Make a change in the app and verify it syncs to Neon

3. Restart backend and verify local data is still there

### Test 5: Test Offline Mode

1. Disconnect internet/Wi-Fi
2. Open app and submit a ticket
3. Reconnect internet
4. Data should sync automatically

---

## 📊 STEP 10: Monitor & Maintenance

### Daily Operations

**Start Server Manually:**

```powershell
# Development mode (auto-reload):
cd "C:\Users\sola\Desktop\ICT Support Desk"
.\start-server-dev.bat

# Production mode:
.\start-server.bat
```

**Check Sync Status:**

- Look at backend console for `[DBSync]` messages
- Expected: Sync runs every 5 minutes (configurable)

### Useful Commands

```powershell
# Reset local database (careful!)
cd backend
npx prisma migrate reset

# Pull latest from Neon to local
npm run sync:pull

# Push local changes to Neon
npm run sync:push

# View database in Prisma Studio
npx prisma studio
```

### Troubleshooting

**Problem:** `ict.local` not resolving

- Solution: Ensure Bonjour is installed and PC is restarted
- Or use IP address directly: `http://192.168.1.50:5173`

**Problem:** Port 5000 already in use

- Solution: Change `PORT` in `.env` or kill the process using it:
  ```powershell
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

**Problem:** Database connection fails

- Solution: Verify PostgreSQL is running and credentials in `.env` are correct
  ```powershell
  psql -U ict_local_user -d ict_support_local
  ```

**Problem:** Sync not working

- Solution: Check `SYNC_ENABLED=true` in `.env` and verify both databases are accessible

---

## 📝 Checklist - Setup Complete When:

- [ ] Node.js 18+ installed and verified
- [ ] PostgreSQL 15+ installed and local database created
- [ ] Bonjour installed and PC restarted
- [ ] IP address is static (or DHCP reserved)
- [ ] `backend/.env` configured with correct database URLs
- [ ] Prisma migrations run successfully
- [ ] Backend runs without errors on `http://localhost:5000`
- [ ] Frontend runs on `http://localhost:5173`
- [ ] Network access works from another PC using `ict.local:5173`
- [ ] Auto-start task created in Task Scheduler
- [ ] Tested offline mode and sync
- [ ] PC set to auto-login (optional but recommended)

---

## 🎯 Next Steps

1. **Test Everything:** Run through all tests in Step 9
2. **Train Users:** Show staff how to access `http://ict.local:5173`
3. **Set Up Auto-Login:** Configure PC to auto-login so server starts immediately
4. **Create Backup:** Schedule regular backups of local PostgreSQL database
5. **Monitor Logs:** Periodically check backend console for sync/error logs

---

**Questions?** Refer back to specific steps or check backend server console output for detailed error messages.
