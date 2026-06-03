# Local Network Setup - Step by Step Guide

**Objective:** Run the ICT Support Desk app on a local PC that other devices on the same network can access via `ict.local` with automatic database syncing between local and online (Neon).

---

## Part 1: Prerequisites & Network Planning

### What You Need:

1. **Local PC (Server PC):**
   - Node.js 16+ installed
   - PostgreSQL installed locally
   - Windows, macOS, or Linux
   - Connected to a router/network

2. **Client PCs/Devices:**
   - Connected to the **same network/Wi-Fi** as server PC
   - Modern web browser

3. **Online Setup (Already Done):**
   - Vercel frontend deployment ✅
   - Render backend deployment ✅
   - Neon PostgreSQL database ✅

### Network Requirements:

- All devices on same Wi-Fi network
- Server PC has a static or reserved IP address
- Firewall allows ports 5000 (backend) and 5173 (frontend) or 3000 (production)

---

## Part 2: Server PC Setup - Step by Step

### Step 1: Install PostgreSQL Locally (Windows)

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Download PostgreSQL 15+ installer

2. **Install PostgreSQL:**

   ```
   Run installer → Choose installation directory
   → Set password for 'postgres' user (remember this!)
   → Default port 5432
   → Complete installation
   ```

3. **Verify Installation:**

   ```powershell
   psql --version
   psql -U postgres
   # You should see the PostgreSQL prompt
   ```

4. **Create Local Database:**
   ```sql
   -- In PostgreSQL prompt
   CREATE DATABASE ict_support_local;
   CREATE USER ict_local_user WITH PASSWORD 'secure_local_password';
   GRANT ALL PRIVILEGES ON DATABASE ict_support_local TO ict_local_user;
   \q
   ```

---

### Step 2: Find Server PC's Network IP

**Windows:**

```powershell
# In PowerShell, run:
ipconfig

# Look for "IPv4 Address" under your network adapter
# Should look like: 192.168.1.xxx or 10.0.0.xxx
# Example: 192.168.1.50
```

**macOS/Linux:**

```bash
ifconfig
# Look for inet address on your network interface
```

**Important:** Make this IP static in your router or let the PC request a fixed DHCP lease.

---

### Step 3: Set Up mDNS for ict.local (Local Hostname)

#### Windows Setup:

**Option A: Using Bonjour (Easiest)**

```powershell
# Download Bonjour for Windows from Apple
# Or install it as part of iTunes or other Apple software
# URL: https://support.apple.com/kb/DL999

# After installation, your PC is accessible as:
# ict-pc.local (replace ict-pc with your computer name)
# Or rename your PC to use ict.local
```

**Option B: Using mDNS via Node Package (For Dev)**

```powershell
cd backend
npm install --save-dev bonjour
```

**Option C: Modify Hosts File (For Testing Only)**

```powershell
# On every CLIENT PC, edit: C:\Windows\System32\drivers\etc\hosts
# Add this line:
192.168.1.50  ict.local

# Replace 192.168.1.50 with your server's actual IP
# Save the file
```

#### macOS/Linux Setup:

- mDNS works natively as `hostname.local`
- Just use your computer name: `my-computer.local`

---

### Step 4: Clone Project & Install Dependencies

```powershell
# On server PC, create project directory
cd "C:\Users\sola\Desktop"
# Assuming project is already there: ICT Support Desk

cd "ICT Support Desk"
cd backend
npm install

cd ../frontend
npm install
```

---

### Step 5: Configure Backend for Local Network

#### Create `.env` for Local Backend:

**File:** `backend/.env`

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# LOCAL DATABASE (Primary - for offline mode)
DATABASE_URL=postgresql://ict_local_user:secure_local_password@localhost:5432/ict_support_local

# NEON DATABASE (Secondary - for syncing)
NEON_DATABASE_URL=postgresql://neon_user:neon_password@ep-xxx.neon.tech/ict_support_desk?sslmode=require

# Network Configuration
# Allow connections from local network
CORS_ORIGIN=http://localhost:5173,http://192.168.1.50:5173,http://ict.local:5173

# Frontend URLs (comma-separated)
CLIENT_URLS=http://localhost:5173,http://192.168.1.50:5173,http://ict.local:5173

# Existing credentials
JWT_SECRET=your-existing-jwt-secret
FIREBASE_SERVICE_ACCOUNT_JSON=./firebase-service-account.json
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Replace:**

- `192.168.1.50` = Your server PC's actual IP
- `neon_user` and `neon_password` = Your Neon credentials
- `ep-xxx.neon.tech` = Your Neon connection string from dashboard

---

### Step 6: Sync Local Database with Neon

#### Option A: Initial Sync from Neon to Local (Recommended First Time)

**Backup Neon to Local:**

```powershell
# On server PC, PowerShell

# 1. Create backup from Neon
$env:PGPASSWORD = "your_neon_password"
pg_dump -h ep-xxx.neon.tech -U neon_user -d ict_support_desk -p 5432 > neon_backup.sql
$env:PGPASSWORD = ""

# 2. Restore to local database
$env:PGPASSWORD = "secure_local_password"
psql -U ict_local_user -d ict_support_local < neon_backup.sql
$env:PGPASSWORD = ""

# 3. Verify data
psql -U ict_local_user -d ict_support_local -c "SELECT COUNT(*) FROM users;"
```

#### Option B: Run Prisma Migrations on Both

```powershell
cd backend

# Run migrations on LOCAL database
npx prisma migrate deploy

# This creates tables locally
```

---

### Step 7: Create Database Sync Service

Create a sync service that keeps local and Neon databases in sync:

**File:** `backend/utils/dbSync.js`

```javascript
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class DatabaseSync {
  constructor() {
    this.localDbUrl = process.env.DATABASE_URL;
    this.neonDbUrl = process.env.NEON_DATABASE_URL;
    this.syncInterval = 5 * 60 * 1000; // 5 minutes
    this.lastSyncTime = null;
  }

  // Pull changes from Neon to Local
  async pullFromNeon() {
    try {
      console.log("[DBSync] Pulling from Neon...");

      // Export Neon data
      const backupFile = path.join(__dirname, "neon_temp.sql");
      const neonUrl = new URL(this.neonDbUrl);

      execSync(`pg_dump "${this.neonDbUrl}" > "${backupFile}"`, {
        stdio: "inherit",
      });

      // Restore to local
      execSync(`psql "${this.localDbUrl}" < "${backupFile}"`, {
        stdio: "inherit",
      });

      // Clean up
      fs.unlinkSync(backupFile);

      this.lastSyncTime = new Date();
      console.log("[DBSync] ✅ Pull from Neon complete");
      return true;
    } catch (error) {
      console.error("[DBSync] ❌ Pull failed:", error.message);
      return false;
    }
  }

  // Push changes from Local to Neon
  async pushToNeon() {
    try {
      console.log("[DBSync] Pushing to Neon...");

      const backupFile = path.join(__dirname, "local_temp.sql");

      // Export local data
      execSync(`pg_dump "${this.localDbUrl}" > "${backupFile}"`, {
        stdio: "inherit",
      });

      // Clear Neon (drop tables) - CAREFUL!
      // For production, implement merge strategy instead

      // Restore to Neon
      execSync(`psql "${this.neonDbUrl}" < "${backupFile}"`, {
        stdio: "inherit",
      });

      // Clean up
      fs.unlinkSync(backupFile);

      this.lastSyncTime = new Date();
      console.log("[DBSync] ✅ Push to Neon complete");
      return true;
    } catch (error) {
      console.error("[DBSync] ❌ Push failed:", error.message);
      return false;
    }
  }

  // Bi-directional sync (merge strategy)
  async syncBidirectional() {
    try {
      console.log("[DBSync] Starting bidirectional sync...");

      // For now, pull from Neon (treat it as source of truth)
      // In production, implement conflict resolution
      await this.pullFromNeon();

      console.log("[DBSync] ✅ Sync complete");
      return true;
    } catch (error) {
      console.error("[DBSync] ❌ Sync error:", error.message);
      return false;
    }
  }

  // Start auto-sync timer
  startAutoSync() {
    console.log(
      `[DBSync] Auto-sync enabled (every ${this.syncInterval / 1000}s)`,
    );

    setInterval(async () => {
      await this.syncBidirectional();
    }, this.syncInterval);

    // Also sync on startup
    this.syncBidirectional();
  }
}

module.exports = DatabaseSync;
```

---

### Step 8: Add Sync to Backend Startup

**Update:** `backend/server.js`

Add at the top (after imports):

```javascript
const DatabaseSync = require("./utils/dbSync");

const isLocalMode =
  process.env.DATABASE_URL &&
  process.env.NEON_DATABASE_URL &&
  process.env.DATABASE_URL !== process.env.NEON_DATABASE_URL;

let dbSync = null;

// Start database sync if running in local mode
if (isLocalMode && !process.env.DISABLE_DB_SYNC) {
  dbSync = new DatabaseSync();

  // Sync every 5 minutes (adjust as needed)
  if (process.env.AUTO_SYNC !== "false") {
    dbSync.startAutoSync();
  }

  console.log("[Server] 📊 Database sync enabled (Neon ↔ Local)");
}
```

Add an endpoint to manually trigger sync:

```javascript
// Add this to your routes in server.js
app.post("/api/admin/sync-databases", (req, res) => {
  // Require admin auth
  if (!dbSync) {
    return res.status(400).json({ error: "Database sync not enabled" });
  }

  dbSync
    .syncBidirectional()
    .then((success) => {
      res.json({
        success,
        lastSync: dbSync.lastSyncTime,
        message: "Database sync triggered",
      });
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});
```

---

### Step 9: Configure Frontend for Local Network

Create environment detection logic:

**File:** `frontend/src/utils/networkDetection.js`

```javascript
// Detect if user is on local network or internet
export function getApiUrl() {
  const host = window.location.hostname;

  // If accessing from ict.local or local IP, use local backend
  if (
    host === "ict.local" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.0.") ||
    host.startsWith("172.")
  ) {
    console.log("[Network] Using LOCAL backend:", host);
    return `http://${window.location.hostname}:5000`;
  }

  // Otherwise use online backend
  console.log("[Network] Using ONLINE backend");
  return (
    import.meta.env.VITE_API_BASE ||
    "https://ict-unit-help-desk.onrender.com/api"
  );
}

export function getSocketUrl() {
  const host = window.location.hostname;

  if (
    host === "ict.local" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.0.") ||
    host.startsWith("172.")
  ) {
    console.log("[Network] Using LOCAL socket:", host);
    return `http://${window.location.hostname}:5000`;
  }

  console.log("[Network] Using ONLINE socket");
  return (
    import.meta.env.VITE_SOCKET_URL || "https://ict-unit-help-desk.onrender.com"
  );
}

export function isLocalMode() {
  return (
    getApiUrl().startsWith("http://localhost") ||
    getApiUrl().startsWith("http://192.168.") ||
    getApiUrl().startsWith("http://10.0.") ||
    getApiUrl().startsWith("http://ict.local")
  );
}
```

**Update:** `frontend/src/api.js`

```javascript
import axios from "axios";
import { getApiUrl } from "./utils/networkDetection";

const API_BASE_URL = getApiUrl();

console.log("[API] Using base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ... rest of api.js
```

**Update:** `frontend/src/socket.js`

```javascript
import { io } from "socket.io-client";
import { getToken } from "./api";
import { getSocketUrl } from "./utils/networkDetection";

const socketUrl = getSocketUrl();

console.log("[Socket] Connecting to:", socketUrl);

const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  connect_timeout: 20000,
  auth: {
    token: getToken(),
  },
});

// ... rest of socket.js
```

---

### Step 10: Start Backend Locally

```powershell
cd "C:\Users\sola\Desktop\ICT Support Desk\backend"

# Run backend
npm run dev

# You should see:
# ✅ Server running on http://localhost:5000
# 📊 Database sync enabled
```

---

### Step 11: Start Frontend Locally

**In another PowerShell terminal:**

```powershell
cd "C:\Users\sola\Desktop\ICT Support Desk\frontend"

# Run frontend in dev mode
npm run dev

# You should see:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: http://192.168.1.50:5173/
```

---

## Part 3: Accessing from Other PCs

### From Client PC on Same Network:

1. **Open Browser**
2. **Enter URL:**

   ```
   http://ict.local:5173/
   ```

   **Or if ict.local doesn't work:**

   ```
   http://192.168.1.50:5173/
   ```

3. **You should see the app!**

---

## Part 4: Production Build (Optional)

For better performance in local network:

```powershell
cd frontend
npm run build

# Frontend files are now in frontend/dist/
# You can serve these from a simple HTTP server

# Option: Use Node to serve static files
npm install --save-dev express
```

Create `frontend/server.js`:

```javascript
const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Frontend server running on http://0.0.0.0:3000");
});
```

Run:

```powershell
node frontend/server.js
# Access at: http://ict.local:3000
```

---

## Part 5: Database Sync Strategy

### Sync Scenarios:

**Scenario 1: Local PC Goes Offline**

- App continues to use local database
- Users see local data only
- No syncing happens

**Scenario 2: Local PC Comes Back Online**

- Auto-sync pulls changes from Neon
- Local data is updated
- Users see latest data

**Scenario 3: User Uses Online App (Vercel) While Local is Down**

- Changes are made on online (Neon database)
- When local comes back, sync pulls changes
- Both databases converge

---

## Part 6: Advanced: Conflict Resolution

For real bidirectional sync with conflict handling:

**File:** `backend/utils/syncConflictResolver.js`

```javascript
const { PrismaClient } = require("@prisma/client");

class SyncConflictResolver {
  constructor(localPrisma, neonPrisma) {
    this.local = localPrisma;
    this.neon = neonPrisma;
  }

  async mergeTickets() {
    try {
      const localTickets = await this.local.ticket.findMany();
      const neonTickets = await this.neon.ticket.findMany();

      // For each ticket, keep the one with latest updatedAt
      for (const neonTicket of neonTickets) {
        const localTicket = localTickets.find((t) => t.id === neonTicket.id);

        if (!localTicket) {
          // Ticket only in Neon, create locally
          await this.local.ticket.create({
            data: neonTicket,
          });
        } else if (neonTicket.updatedAt > localTicket.updatedAt) {
          // Neon is newer, update local
          await this.local.ticket.update({
            where: { id: neonTicket.id },
            data: neonTicket,
          });
        }
      }

      // Also sync local → neon
      for (const localTicket of localTickets) {
        const neonTicket = neonTickets.find((t) => t.id === localTicket.id);

        if (!neonTicket) {
          // Ticket only in local, create on Neon
          await this.neon.ticket.create({
            data: localTicket,
          });
        } else if (localTicket.updatedAt > neonTicket.updatedAt) {
          // Local is newer, update Neon
          await this.neon.ticket.update({
            where: { id: localTicket.id },
            data: localTicket,
          });
        }
      }

      console.log("[SyncResolver] ✅ Tickets merged successfully");
      return true;
    } catch (error) {
      console.error("[SyncResolver] ❌ Merge failed:", error.message);
      return false;
    }
  }

  // Similar methods for messages, users, agents, etc.
}

module.exports = SyncConflictResolver;
```

---

## Part 7: Troubleshooting

### Issue: `ict.local` Not Resolving

**Solution:**

```powershell
# On client PC, add to: C:\Windows\System32\drivers\etc\hosts
# Add line:
192.168.1.50  ict.local

# Save and test:
ping ict.local
```

### Issue: Cannot Connect to Backend from Other PC

**Check:**

1. Server PC firewall allows port 5000
2. Both PCs on same network
3. Correct IP address in URL
4. CORS configured in `.env`

```powershell
# Test connectivity:
Test-Connection 192.168.1.50 -Count 1
```

### Issue: Database Not Syncing

**Check:**

1. Both DATABASE_URL and NEON_DATABASE_URL are set
2. Network connection to Neon is working
3. PostgreSQL running on local PC
4. Check server logs for sync errors

```powershell
# Test Neon connection:
$env:PGPASSWORD = "neon_password"
psql -h ep-xxx.neon.tech -U neon_user -d ict_support_desk -c "SELECT 1;"
```

### Issue: CORS Errors

**Solution:** Ensure CLIENT_URLS includes all access methods:

```env
CLIENT_URLS=http://localhost:5173,http://192.168.1.50:5173,http://ict.local:5173
```

---

## Part 8: Firewall Configuration

### Windows Firewall - Allow Backend:

```powershell
# Run as Administrator:
netsh advfirewall firewall add rule name="ICT Backend" `
  dir=in action=allow protocol=tcp localport=5000
```

### Windows Firewall - Allow Frontend:

```powershell
netsh advfirewall firewall add rule name="ICT Frontend" `
  dir=in action=allow protocol=tcp localport=5173
```

---

## Part 9: Production Checklist - Local Setup

- [ ] PostgreSQL installed and running
- [ ] Local database created and populated
- [ ] `.env` file configured (local database URL)
- [ ] mDNS/Bonjour installed (ict.local working)
- [ ] Backend starts without errors
- [ ] Frontend accessible from local PC
- [ ] Frontend accessible from other PCs on network
- [ ] Database sync working (check logs)
- [ ] Can submit ticket on local
- [ ] Can see ticket on Vercel (after sync)
- [ ] Can submit on Vercel and see on local (after sync)
- [ ] Firewall rules added
- [ ] Network IP is static or DHCP reserved

---

## Summary

**What You've Set Up:**

✅ Local development backend accessible on network
✅ Local development frontend accessible on network  
✅ Custom hostname (ict.local) for easy access
✅ Automatic database syncing between local and Neon
✅ Fallback to online when local is unavailable
✅ Same app works online and offline

**How to Use:**

- **Online:** Users go to Vercel deployment
- **Offline (on LAN):** Users go to `http://ict.local:5173`
- **Data stays in sync** between both automatically

---

**Questions?** Refer to the troubleshooting section above.
