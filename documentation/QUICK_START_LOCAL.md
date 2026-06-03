# 🏠 Local Network Quick Start Guide

**Want to run the app on a local PC and access it from other computers on the same Wi-Fi?**

This guide gets you there in 5 minutes.

---

## What You'll End Up With

✅ App accessible on local network as `ict.local:5173`  
✅ Local database syncs with online Neon database automatically  
✅ Other users on Wi-Fi access app without internet dependency  
✅ All data stays in sync between online and offline

---

## Quick Setup (Windows)

### 1️⃣ Prerequisites (2 minutes)

**Install these first:**

- Node.js: https://nodejs.org/ (choose LTS)
- PostgreSQL: https://www.postgresql.org/download/windows/
- Bonjour (for ict.local): https://support.apple.com/kb/DL999

Verify installation:

```powershell
node --version
psql --version
```

### 2️⃣ Run Setup Script (2 minutes)

Open PowerShell **as Administrator** in your project folder:

```powershell
cd "C:\Users\sola\Desktop\ICT Support Desk"
.\setup-local.bat
```

**The script will:**

- ✅ Create local PostgreSQL database
- ✅ Install all dependencies
- ✅ Create `.env` file with default values
- ✅ Set up Prisma tables

**When prompted:**

- PostgreSQL password = your `postgres` user password
- Save the IP address shown (e.g., `192.168.1.50`)

### 3️⃣ Configure Neon Connection (1 minute)

Open `backend\.env` and update this line with your actual Neon connection:

```env
NEON_DATABASE_URL=postgresql://username:password@ep-xxxx.neon.tech/ict_support_desk?sslmode=require
```

Get your Neon connection string from:

- Neon Dashboard → Project → Connection → Connection String
- Copy the **whole string** starting with `postgresql://`

### 4️⃣ Start Everything

```powershell
.\start-local.bat
```

Two windows will open:

- **Backend window** - shows port 5000
- **Frontend window** - shows port 5173

Wait 10 seconds for both to fully start.

---

## Access the App

### From Your Computer

- Browser: `http://localhost:5173`
- Mobile on same Wi-Fi: `http://192.168.1.50:5173`

### From Other Computers

- IP address: `http://192.168.1.50:5173` ← Replace with your IP
- Custom hostname: `http://ict.local:5173` ← If Bonjour installed

**Note:** Replace `192.168.1.50` with your IP from step 2️⃣

---

## How It Works

```
User on Wi-Fi → ict.local:5173 (Frontend)
                        ↓
                http://192.168.1.50:5000 (Backend - Local)
                        ↓
            PostgreSQL Local Database
                        ↓
         Auto-syncs every 5 minutes with ↓
                    Neon Database (Online)
```

**If local goes down:**

- Users can still use the online version at Vercel
- When local comes back online, data syncs automatically

**If internet goes down:**

- Local users can still use the app
- Everything is stored locally
- Syncs when internet comes back

---

## Quick Troubleshooting

### ❌ "Can't find database"

- Did you run setup script? `.\setup-local.bat`
- Is PostgreSQL running? Check Windows Services
- Edit `backend\.env` - verify DATABASE_URL

### ❌ "ict.local not working"

- Install Bonjour first
- Or just use IP: `http://192.168.1.50:5173`

### ❌ "Other PC can't see the app"

- Both on same Wi-Fi? ✅
- Check IP is correct (not 127.0.0.1 or localhost)
- Firewall blocking ports? Add exception for 5000, 5173

  ```powershell
  netsh advfirewall firewall add rule name="ICT Support" dir=in action=allow protocol=tcp localport=5000,5173
  ```

### ❌ "Database sync not working"

- Check `backend\.env` has valid `NEON_DATABASE_URL`
- Check internet connection
- Look in backend window for "[DBSync]" messages

---

## macOS/Linux Setup

Same process but use bash scripts:

```bash
chmod +x setup-local.sh start-local.sh
./setup-local.sh
./start-local.sh
```

---

## File Locations

After setup, important files are:

| File                                     | Purpose                           |
| ---------------------------------------- | --------------------------------- |
| `backend\.env`                           | Local database config + Neon sync |
| `frontend/src/utils/networkDetection.js` | Auto-detects local vs online      |
| `backend/utils/dbSync.js`                | Syncs local ↔ Neon                |
| `logs/backend.log`                       | Backend errors                    |
| `logs/frontend.log`                      | Frontend errors                   |

---

## Advanced: Sync Status

Check if databases are in sync:

```bash
# From PowerShell
curl http://localhost:5000/api/sync/status

# Shows:
# {
#   "enabled": true,
#   "lastSyncTime": "2024-06-03T10:30:00.000Z",
#   "syncInProgress": false,
#   ...
# }
```

Manual sync:

```bash
curl -X POST http://localhost:5000/api/sync/trigger
```

---

## Next Steps

1. ✅ Run `setup-local.bat`
2. ✅ Update `backend\.env` with Neon URL
3. ✅ Run `start-local.bat`
4. ✅ Visit `http://ict.local:5173` or your IP
5. ✅ Test from another computer on Wi-Fi

---

**That's it! Your app is now accessible locally and synced with the online version.** 🎉

Questions? Check the full guide in `LOCAL_NETWORK_SETUP.md`
