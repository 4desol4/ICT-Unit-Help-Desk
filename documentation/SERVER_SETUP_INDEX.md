# 🎯 ICT Support Desk - Complete Server Setup Index

**Your quick reference for setting up a local network server that runs on boot!**

---

## 📚 Documentation Files

### Main Setup Guide

- **[SERVER_SETUP_GUIDE.md](SERVER_SETUP_GUIDE.md)** ⭐ START HERE
  - Complete 10-step setup process
  - Network configuration
  - Database sync setup
  - Auto-start on boot
  - Testing & troubleshooting

### Quick References

- **[LOCAL_NETWORK_SETUP.md](documentation/LOCAL_NETWORK_SETUP.md)** - Detailed network setup
- **[QUICK_START_LOCAL.md](documentation/QUICK_START_LOCAL.md)** - 5-minute quick start

---

## 🛠️ Setup Scripts

### Automated Setup

| Script                | Purpose                            | When to Use         |
| --------------------- | ---------------------------------- | ------------------- |
| `network-config.bat`  | Detect IP & configure URLs         | First time setup    |
| `setup-autostart.ps1` | Create Windows Task Scheduler task | After backend works |

### Server Startup Scripts

| Script                 | Mode            | Ports | Use Case                            |
| ---------------------- | --------------- | ----- | ----------------------------------- |
| `start-server.bat`     | **Production**  | 3000  | Running on boot / Daily use         |
| `start-server-dev.bat` | **Development** | 5173  | Development / Testing / Auto-reload |

---

## 🚀 Quick Start Path

### First Time Setup (45-60 minutes)

**Step 1: Prerequisites** (10 min)

- [ ] Install Node.js 18+ from https://nodejs.org/
- [ ] Install PostgreSQL 15+ from https://www.postgresql.org/
- [ ] Install Bonjour from https://support.apple.com/kb/DL999
- [ ] Verify: `node --version`, `psql --version`

**Step 2: Network Setup** (10 min)

- [ ] Run `network-config.bat`
- [ ] Note your server IP (e.g., `192.168.1.50`)
- [ ] Make IP static in router or Windows settings

**Step 3: Configure Application** (15 min)

- [ ] Edit `backend/.env` - Update `DATABASE_URL` and `NEON_DATABASE_URL`
- [ ] Edit `backend/.env` - Update `CLIENT_URLS` with your IP
- [ ] Run: `cd backend && npm install`
- [ ] Run: `npx prisma migrate deploy`

**Step 4: Test It** (5 min)

- [ ] Run: `start-server-dev.bat`
- [ ] Open browser: `http://localhost:5173`
- [ ] From another PC: `http://ict.local:5173`

**Step 5: Auto-Start Setup** (5 min)

- [ ] Run PowerShell as Administrator
- [ ] Execute: `PowerShell -ExecutionPolicy Bypass -File setup-autostart.ps1`
- [ ] Restart PC to test auto-start

---

## 📋 Configuration Checklist

### Backend Configuration (`backend/.env`)

```env
# Critical Settings
NODE_ENV=development
PORT=5000

# Database URLs
DATABASE_URL=postgresql://ict_local_user:PASSWORD@localhost:5432/ict_support_local
NEON_DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxxx.neon.tech/neondb?sslmode=require

# Network (Replace with your IP from ipconfig)
CLIENT_URLS=http://localhost:5173,http://192.168.1.50:5173,http://ict.local:5173,http://localhost:3000
CORS_ORIGIN=http://localhost:5173,http://192.168.1.50:5173,http://ict.local:5173,http://localhost:3000

# Sync Settings
SYNC_ENABLED=true
SYNC_MODE=bidirectional
AUTO_SYNC=true
```

### Frontend Configuration (Development)

No special local setup needed - uses `localhost` by default.

---

## 🔄 Database Sync Explained

### How It Works

1. **Local Database:** PostgreSQL on your PC (primary)
2. **Cloud Database:** Neon (backup & remote sync)
3. **Bidirectional Sync:** Automatic every 5 minutes

### Sync Modes

| Mode            | Direction    | Use Case                  |
| --------------- | ------------ | ------------------------- |
| `pull`          | Neon → Local | First time setup          |
| `push`          | Local → Neon | Push local changes online |
| `bidirectional` | Both ways    | Production (default)      |

### Check Sync Status

Backend console shows:

```
[DBSync] Starting sync cycle...
[DBSync] Pull sync completed
[DBSync] Sync took 2.5 seconds
```

---

## 🌐 Network Access

### From Your Server PC

- Backend API: `http://localhost:5000`
- Frontend Dev: `http://localhost:5173`
- Frontend Prod: `http://localhost:3000`

### From Other PCs on Same Wi-Fi

- Via IP: `http://192.168.1.50:5173`
- Via Hostname: `http://ict.local:5173` (with Bonjour installed)

### From Outside Network

- Via Online: `https://ict-unit-help-desk.vercel.app`

---

## ⚙️ Auto-Start on Boot

### How It Works

1. **Windows Task Scheduler** runs `start-server.bat` at startup
2. **Two command windows** open automatically
3. **Services start** and application is ready after ~10 seconds

### Setup

```powershell
# Run as Administrator:
PowerShell -ExecutionPolicy Bypass -File setup-autostart.ps1
```

### Verify

1. Open Task Scheduler (`Win+R` → `taskschd.msc`)
2. Find: "ICT Support Desk - Auto-Start"
3. Right-click → Properties to modify

### Troubleshooting

- Task not running? Check "Run with highest privileges" is enabled
- Windows blocked it? Check Windows Defender logs
- Want to disable? Right-click task → Disable

---

## 🧪 Testing Checklist

- [ ] Backend responds: `curl http://localhost:5000`
- [ ] Frontend loads: `http://localhost:5173`
- [ ] Network access works: `http://ict.local:5173` (from another PC)
- [ ] Can login with test credentials
- [ ] Can submit a ticket
- [ ] Database sync shows in logs: `[DBSync]` messages
- [ ] Changes sync to Neon (wait 5 min, check online)
- [ ] Offline mode works (disconnect internet, app still functions)
- [ ] Sync resumes when internet returns
- [ ] Auto-start works (restart PC, app starts automatically)

---

## 🔧 Troubleshooting

### "ict.local not found"

→ Ensure Bonjour is installed and PC restarted
→ Or use IP directly: `http://192.168.1.50:5173`

### "Port 5000 already in use"

→ Change `PORT` in `backend/.env`
→ Or kill process: `netstat -ano | findstr :5000`

### "Cannot connect to PostgreSQL"

→ Check PostgreSQL is running: `services.msc`
→ Verify credentials in `DATABASE_URL`
→ Test: `psql -U ict_local_user -d ict_support_local`

### "Auto-start not working"

→ Check task in Task Scheduler with elevated privileges
→ Manually test: Right-click task → Run
→ Check Windows Event Viewer for errors

### "Sync not working"

→ Verify `SYNC_ENABLED=true` in `.env`
→ Check backend console for `[DBSync]` messages
→ Test databases are accessible

---

## 📊 Useful Commands

```powershell
# Check what's running on ports
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Kill a process by PID
taskkill /PID 12345 /F

# View running Node processes
Get-Process | Where-Object { $_.ProcessName -like '*node*' }

# Restart PostgreSQL service
net stop postgresql-x64-15
net start postgresql-x64-15

# Test database connection
psql -U ict_local_user -d ict_support_local -c "SELECT 1"

# View Prisma Studio
cd backend
npx prisma studio

# Reset local database (careful!)
cd backend
npx prisma migrate reset
```

---

## 🔐 Security Notes

⚠️ **Local Network Only**

- This setup is for internal network use only
- Not recommended for internet-facing deployment
- For public access, use: Vercel (frontend) + Render/Railway (backend)

⚠️ **Credentials**

- Change PostgreSQL password from default
- Use strong JWT_SECRET
- Never commit `.env` to Git

⚠️ **Firewall**

- Ports 5000 and 5173 must be allowed through Windows Firewall
- Can be configured via Windows Defender Firewall settings

---

## 📞 Support Quick Links

| Issue                         | Solution                                                   |
| ----------------------------- | ---------------------------------------------------------- |
| "Can't access from other PCs" | Check Bonjour installed, make IP static, verify firewall   |
| "Database sync not working"   | Verify both DATABASE_URL and NEON_DATABASE_URL in .env     |
| "Backend won't start"         | Check npm install ran, PostgreSQL running, ports available |
| "Auto-start not working"      | Run setup-autostart.ps1 as Administrator                   |
| "Stuck on login page"         | Check backend is running (backend window open)             |

---

## 📅 Maintenance

### Daily

- Start server: `start-server.bat`
- Check console for errors

### Weekly

- Monitor database size: `du -sh backend/db`
- Review sync logs for issues

### Monthly

- Backup local PostgreSQL:
  ```powershell
  cd backend
  npx prisma db push
  ```

### As Needed

- Update Node packages: `npm update`
- Run migrations: `npx prisma migrate deploy`
- Reset database: `npx prisma migrate reset`

---

## 🎓 Next Steps

1. **Read:** [SERVER_SETUP_GUIDE.md](SERVER_SETUP_GUIDE.md) - Full detailed guide
2. **Configure:** Edit `.env` files with your credentials
3. **Test:** Run `start-server-dev.bat` and access from another PC
4. **Deploy:** Run `setup-autostart.ps1` for boot startup
5. **Verify:** Restart PC and confirm auto-start works

---

**Version:** 1.0  
**Last Updated:** 2026-06-09  
**Status:** Production Ready ✅
