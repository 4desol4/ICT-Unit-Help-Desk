# 🎯 Complete Walkthrough - Your First Server Setup

**Follow this step-by-step to get your server running today**

---

## 🚀 Phase 1: Prerequisites (10-15 minutes)

### Step 1.1: Check Your PC Configuration

Open PowerShell and note these:

```powershell
# Check Windows version
[System.Environment]::OSVersion.VersionString

# Should show: Microsoft Windows NT 10.0.xxxxx (Windows 10/11)
```

### Step 1.2: Install Node.js

1. Visit: https://nodejs.org/
2. Click **"Download LTS"** (not Latest)
3. Run installer and complete setup
4. **Restart your PC**

Verify installation:

```powershell
node --version
npm --version

# Should show v18.x.x or higher
```

### Step 1.3: Install PostgreSQL

1. Visit: https://www.postgresql.org/download/windows/
2. Download **PostgreSQL 15** or **16**
3. Run installer
4. **Remember the `postgres` user password you set!**
5. Keep default port: **5432**
6. Restart your PC

Verify installation:

```powershell
psql --version

# Should show psql (PostgreSQL) 15.x or 16.x
```

### Step 1.4: Install Bonjour

1. Visit: https://support.apple.com/kb/DL999
2. Click **"Download"** for Windows
3. Run installer and complete setup
4. **Restart your PC again**

You now have all prerequisites! ✅

---

## 🌐 Phase 2: Network Setup (10-15 minutes)

### Step 2.1: Find Your Server IP

Open PowerShell and run:

```powershell
ipconfig
```

Look for your network adapter (WiFi or Ethernet) and find **IPv4 Address**.

Example output:

```
Ethernet adapter Ethernet:
   IPv4 Address. . . . . . . . . : 192.168.1.50
   Subnet Mask . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . : 192.168.1.1
```

**Write down your IP:** `192.168.1.50` (yours will be different)

### Step 2.2: Make IP Static

**Option A: Via Router (RECOMMENDED)**

1. Open browser and go to: `192.168.1.1` (your router's IP)
   - Default username/password: `admin`/`admin` (varies by router)
2. Find "DHCP Reservation" or "Static IP Binding"
3. Enter your PC's IP address: `192.168.1.50`
4. Save and your IP is now permanent

**Option B: Via Windows Settings**

1. Right-click **Start Menu** → **Settings**
2. Go to **Network & Internet** → **Wi-Fi** (or Ethernet)
3. Click **"Change adapter options"**
4. Right-click your network → **Properties**
5. Select **IPv4** → **Properties**
6. Click **"Use the following IP address"**
7. Enter:
   - IP: `192.168.1.50` (from your ipconfig)
   - Mask: `255.255.255.0`
   - Gateway: `192.168.1.1`
8. Click **OK** and close

Your IP is now static! ✅

### Step 2.3: Configure ict.local Hostname

On your **server PC** (this PC):

- Already done with Bonjour! Your PC is now reachable as `COMPUTERNAME.local`

On **other PCs** that need to access the app:

1. Open **Notepad as Administrator**
2. Go to **File** → **Open**
3. Navigate to: `C:\Windows\System32\drivers\etc\`
4. Change file type filter to **"All Files"**
5. Open **hosts** file (no extension)
6. Add this line at the very end:

   ```
   192.168.1.50  ict.local
   ```

   Replace `192.168.1.50` with your actual server IP from step 2.1

7. Save the file (Ctrl+S)
8. Close Notepad

Test from that PC:

```powershell
ping ict.local

# Should respond with your server's IP
```

✅ All client PCs configured!

---

## 🗄️ Phase 3: Database Setup (10-15 minutes)

### Step 3.1: Create Local Database

Open **PowerShell as Administrator** and run:

```powershell
psql -U postgres
```

When prompted, enter the PostgreSQL password you set during installation.

You should see:

```
postgres=#
```

Now paste these commands one by one:

```sql
CREATE DATABASE ict_support_local;
CREATE USER ict_local_user WITH PASSWORD 'ict_local_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE ict_support_local TO ict_local_user;
\q
```

Test it worked:

```powershell
psql -U ict_local_user -d ict_support_local
```

Should connect without error. If it asks for password, use: `ict_local_secure_2024`

Type `\q` to quit.

✅ Local database created!

---

## ⚙️ Phase 4: Application Setup (15-20 minutes)

### Step 4.1: Navigate to Project Folder

```powershell
cd "C:\Users\sola\Desktop\ICT Support Desk"
```

### Step 4.2: Update Backend Configuration

1. Open **backend\.env** in VS Code or Notepad
2. Find and update these lines:

```env
# Update your IP (from Step 2.1)
CLIENT_URLS=http://localhost:5173,http://192.168.1.50:5173,http://ict.local:5173,http://localhost:3000
CORS_ORIGIN=http://localhost:5173,http://192.168.1.50:5173,http://ict.local:5173,http://localhost:3000

# These should already be correct:
DATABASE_URL=postgresql://ict_local_user:ict_local_secure_2024@localhost:5432/ict_support_local
NEON_DATABASE_URL=postgresql://neondb_owner:npg_h7PueV2zTMaq@ep-divine-surf-apxxjnjl.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require

# Sync settings (should be enabled)
SYNC_ENABLED=true
SYNC_MODE=bidirectional
AUTO_SYNC=true
```

3. Save the file

### Step 4.3: Install Dependencies

```powershell
cd backend
npm install

cd ..\frontend
npm install

cd ..
```

This downloads all required packages (takes 2-5 minutes).

### Step 4.4: Setup Database Schema

```powershell
cd backend
npx prisma migrate deploy
```

This creates all tables in your local database.

✅ Application configured!

---

## 🚀 Phase 5: Test It! (5 minutes)

### Step 5.1: Start Development Server

```powershell
.\start-server-dev.bat
```

Two command windows will open:

1. **Backend** - shows "Server running on port 5000"
2. **Frontend** - shows "VITE v..." and "ready in xxx ms"

Wait 10 seconds for both to fully start.

### Step 5.2: Test from Your PC

Open browser and go to:

```
http://localhost:5173
```

You should see the **ICT Support Desk login page** ✅

### Step 5.3: Test from Another PC on Same Wi-Fi

On a **different device** connected to the same Wi-Fi:

Open browser and go to:

```
http://ict.local:5173
```

Or use IP directly:

```
http://192.168.1.50:5173
```

You should see the **same login page** ✅

**Congratulations!** Your server is accessible from the network!

### Step 5.4: Test Login & Basic Features

1. Try logging in with admin credentials
2. Submit a test ticket
3. Check database sync messages in backend window
   - Look for `[DBSync]` messages
   - Should say "Sync completed" every 5 minutes

### Step 5.5: Test Offline Mode

1. Note the status in backend window
2. **Disconnect internet** (unplug ethernet or turn off Wi-Fi)
3. Refresh browser - app should still load
4. Submit another test ticket offline
5. **Reconnect internet**
6. After 5 minutes, check backend log for sync message
7. Offline ticket should now be in Neon (check online at vercel link)

✅ **All testing passed!**

---

## 🔧 Phase 6: Auto-Start Setup (5 minutes)

### Step 6.1: Create Auto-Start Task

Open **PowerShell as Administrator** and run:

```powershell
cd "C:\Users\sola\Desktop\ICT Support Desk"
PowerShell -ExecutionPolicy Bypass -File setup-autostart.ps1
```

The script will:

- Create a Windows Task Scheduler task
- Set it to run on startup
- Show you the configuration

### Step 6.2: Test Auto-Start

1. **Close all server windows** (backend and frontend)
2. **Restart your PC**
   - Windows will restart (can take 1-2 minutes)
   - Don't be concerned if you see brief command window
3. Wait 20-30 seconds after login
4. Open browser to `http://localhost:3000` or `http://ict.local:3000`
5. App should be running! ✅

If it doesn't work:

- Check Task Scheduler for the task (Win+R → taskschd.msc)
- Make sure PostgreSQL service is started
- Check backend/frontend windows for errors

---

## 📊 Phase 7: Verify Everything Works

Use this checklist to confirm everything:

- [ ] **Network Access**
  - [ ] `http://localhost:5173` works on this PC
  - [ ] `http://ict.local:5173` works on another PC
  - [ ] `http://192.168.1.50:5173` works on another PC

- [ ] **Database**
  - [ ] Local database has tables (run `npx prisma studio`)
  - [ ] Can login to application
  - [ ] Can submit tickets

- [ ] **Sync**
  - [ ] Backend log shows `[DBSync]` messages
  - [ ] Changes sync every ~5 minutes
  - [ ] Offline mode works (disconnect internet, app still works)
  - [ ] Sync resumes when internet returns

- [ ] **Auto-Start**
  - [ ] PC restarts, app starts automatically
  - [ ] No manual intervention needed
  - [ ] Task appears in Task Scheduler

- [ ] **All Users Can Access**
  - [ ] Multiple PCs on same Wi-Fi can access
  - [ ] All see the same data
  - [ ] Changes appear on all screens

---

## 🎯 You're Done! What Now?

### Daily Use

```powershell
# Just restart the PC or run:
.\start-server.bat          # Production mode (port 3000)
# or
.\start-server-dev.bat      # Development mode (port 5173)
```

### For Development/Testing

```powershell
# Use dev server for auto-reload:
.\start-server-dev.bat
```

### For Regular Operations

- PC auto-starts on boot (configured in Phase 6)
- Access at `http://ict.local:3000`
- Database syncs automatically
- Works offline and online

### Optional: Useful Commands

```powershell
# View database in Prisma Studio
cd backend
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset

# Check sync status in logs
# Look at backend window for [DBSync] messages

# Manually trigger sync
node manual-sync.js
```

---

## 🆘 Quick Troubleshooting

### App won't start

- Verify Node.js: `node --version`
- Verify PostgreSQL running: `services.msc`
- Check ports available: `netstat -ano | findstr :5000`

### Can't access from another PC

- Check Bonjour installed on server PC
- Check firewall allows ports 5000/5173
- Try using IP directly instead of `ict.local`
- Verify both PCs on same Wi-Fi

### Database errors

- Check credentials in `.env` match PostgreSQL setup
- Test connection: `psql -U ict_local_user -d ict_support_local`
- Verify PostgreSQL service running

### Sync not working

- Check `SYNC_ENABLED=true` in `.env`
- Check both `DATABASE_URL` and `NEON_DATABASE_URL` exist
- Restart backend: Close and run `start-server-dev.bat` again
- Check internet connection

### Auto-start not working

- Open Task Scheduler: Win+R → taskschd.msc
- Find "ICT Support Desk - Auto-Start"
- Right-click → Run to test
- Check "Run with highest privileges" is enabled

---

## 📚 Reference Guides

For detailed information, see:

- **[SERVER_SETUP_INDEX.md](SERVER_SETUP_INDEX.md)** - Complete index
- **[SERVER_SETUP_GUIDE.md](SERVER_SETUP_GUIDE.md)** - Detailed 10-step guide
- **[DATABASE_SYNC_GUIDE.md](DATABASE_SYNC_GUIDE.md)** - Sync details
- **[documentation/LOCAL_NETWORK_SETUP.md](documentation/LOCAL_NETWORK_SETUP.md)** - Network setup details

---

**Estimated Total Time:** 60-90 minutes (first time only)

**Once set up:** Just restart PC - everything starts automatically! ✅

**Questions?** Refer to troubleshooting section or check backend console logs for errors.

---

**Version:** 1.0  
**Date:** 2026-06-09  
**Status:** Ready to Deploy! 🚀
