# 🔄 Bidirectional Database Sync Guide

**How to keep your local PostgreSQL database in sync with Neon cloud automatically**

---

## 📊 Overview

Your application has **automatic bidirectional sync** built-in. This means:

- **Offline Mode:** All data goes to local PostgreSQL
- **Online Mode:** Data syncs to Neon automatically
- **Always In Sync:** Changes appear on both databases
- **Zero Data Loss:** Conflicts are handled intelligently

---

## 🔧 Configuration

### In `backend/.env`:

```env
# ========================================
# SYNC SETTINGS
# ========================================

# Enable/Disable sync
SYNC_ENABLED=true

# How often to sync (milliseconds)
# 300000 = 5 minutes (recommended)
# 60000 = 1 minute (more frequent)
# 900000 = 15 minutes (less frequent)
SYNC_INTERVAL=300000

# Sync Direction
# - pull: Only pull from Neon to local
# - push: Only push from local to Neon
# - bidirectional: Both ways (recommended)
SYNC_MODE=bidirectional

# Auto-start sync on server startup
AUTO_SYNC=true
```

---

## 🔀 Sync Modes Explained

### 1. Pull Mode (One-way: Neon → Local)

**Use Case:** First time setup

- Pulls all data from Neon to local
- Useful for initializing local database
- Good for backup recovery

**Configuration:**

```env
SYNC_MODE=pull
```

**What Happens:**

```
1. Server starts
2. Reads all tables from Neon
3. Writes to local PostgreSQL
4. Local database is now a copy of Neon
```

### 2. Push Mode (One-way: Local → Neon)

**Use Case:** Publishing local changes

- Pushes all changes from local to Neon
- Good for controlled deployments
- Risky if Neon has newer data

**Configuration:**

```env
SYNC_MODE=push
```

**What Happens:**

```
1. Server starts
2. Reads changes from local PostgreSQL
3. Writes to Neon
4. Neon now matches local
```

### 3. Bidirectional Mode (Two-way: Both ↔ Both)

**Use Case:** Production with offline mode ⭐ RECOMMENDED

- Syncs changes in both directions
- Detects conflicts intelligently
- Handles offline → online transitions
- Data always stays in sync

**Configuration:**

```env
SYNC_MODE=bidirectional
```

**What Happens:**

```
Loop every 5 minutes (configurable):
  1. Read changes from local
  2. Write to Neon
  3. Read changes from Neon
  4. Write to local
  5. Resolve any conflicts
```

---

## 💾 How Bidirectional Sync Works

### Scenario 1: Online Changes

```
Time  |  Local DB  |  Neon DB   |  Action
------|------------|------------|-------------------
0:00  |  Ticket 1  |  Ticket 1  |  Synced
0:01  |  Ticket 1  |  Ticket 2  |  Added online
      |            |            |
0:05  |  Ticket 2  |  Ticket 2  |  ✅ Synced in next cycle
```

**Result:** Changes made online appear in local database within 5 minutes.

### Scenario 2: Offline Changes

```
Time  |  Local DB  |  Neon DB   |  Status
------|------------|------------|-------------------
10:00 |  Ticket 1  |  Ticket 1  |  Internet: ON
      |            |            |  Synced
10:05 |  Ticket 1  |  Ticket 1  |  Internet: OFF ❌
10:06 |  Ticket 2  |  Ticket 1  |  User adds ticket (offline)
      |            |            |  Neon doesn't update
10:10 |  Ticket 2  |  Ticket 1  |  Still offline
10:15 |  Ticket 2  |  Ticket 1  |  Still offline
10:20 |  Ticket 2  |  Ticket 1  |  Internet: ON ✅
      |            |            |
10:25 |  Ticket 2  |  Ticket 2  |  ✅ Synced! Data preserved
```

**Result:** Offline changes are preserved and sync when internet returns.

### Scenario 3: Conflict Resolution

```
Time  |  Local DB  |  Neon DB   |  Action
------|------------|------------|-------------------
0:00  |  Ticket 1  |  Ticket 1  |  Last sync
      |  Updated   |            |  User edits offline
      |  10:05     |  Updated   |  User edits online
      |            |  10:06     |
0:05  |  ???       |  ???       |  Sync runs
      |            |            |  Which version wins?
      |            |            |
      |  Latest    |  Latest    |  ✅ Newest wins!
      |  (10:06)   |  (10:06)   |  Conflict resolved
```

**Result:** The most recently updated version wins automatically.

---

## 📋 Sync Workflow on Application Startup

```
1. Server Starts
   ↓
2. Check: Is internet available?
   ├─ YES: Enable sync (can reach Neon)
   └─ NO: Disable sync (Neon unreachable)
   ↓
3. Check: AUTO_SYNC enabled?
   ├─ YES: Start automatic sync loop
   └─ NO: Sync only on demand
   ↓
4. Run first sync cycle:
   - Pull from Neon
   - Push local changes
   - Check for conflicts
   ↓
5. Set up recurring sync:
   - Every 5 minutes (or SYNC_INTERVAL)
   - Each cycle: pull → push → resolve
   ↓
6. Application Ready ✅
```

---

## 🛠️ Manual Sync Commands

You can trigger sync manually from backend console:

### Via Node.js Script

Create `backend/manual-sync.js`:

```javascript
const DatabaseSync = require("./utils/dbSync");

const dbSync = new DatabaseSync({
  syncMode: "bidirectional",
});

console.log("🔄 Starting manual sync...");

dbSync
  .sync("pull")
  .then(() => {
    console.log("✅ Pull sync completed");
    return dbSync.sync("push");
  })
  .then(() => {
    console.log("✅ Push sync completed");
    console.log("🔄 Sync complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Sync failed:", err);
    process.exit(1);
  });
```

Run it:

```powershell
cd backend
node manual-sync.js
```

---

## 📊 Monitoring Sync Status

### In Server Console

Look for these messages:

```
[DBSync] Sync enabled ✅
[DBSync] Starting sync cycle...
[DBSync] Pull from Neon completed
[DBSync] Push to local completed
[DBSync] Checking for conflicts...
[DBSync] Sync took 2.5 seconds
[DBSync] Next sync in 5 minutes
```

### Checking Sync Logs

Backend window shows all sync activity in real-time:

```powershell
# Example output:
13:00:00 [DBSync] 🔄 Starting sync cycle...
13:00:02 [DBSync] ✅ Pulled 5 records from Neon
13:00:03 [DBSync] ✅ Pushed 2 changes to Neon
13:00:04 [DBSync] ✅ No conflicts detected
13:00:04 [DBSync] 🎯 Sync completed in 4 seconds
13:00:04 [DBSync] ⏱️  Next sync at 13:05:00
```

### Database Comparison

To manually check if databases are in sync:

```powershell
# Count records in local database
psql -U ict_local_user -d ict_support_local -c "SELECT COUNT(*) FROM tickets;"

# Compare with Neon (requires psql connection to Neon)
psql postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb -c "SELECT COUNT(*) FROM tickets;"

# Should match (or be very close depending on sync timing)
```

---

## 🔍 Detecting Out-of-Sync Issues

### Signs Something's Wrong

1. **No Sync Messages in Console**
   - Check: `SYNC_ENABLED=true` in `.env`
   - Check: Both databases configured
   - Fix: Restart backend

2. **Data Appears Inconsistent**
   - Check: Run manual sync
   - Check: Is internet available? (Watch for connection errors)
   - Fix: Check database URLs are correct

3. **Sync Takes Too Long**
   - Check: Database sizes
   - Check: Network speed
   - Increase: `SYNC_INTERVAL` if it's too frequent

### Debug Commands

```powershell
# Check if both databases exist
psql -U ict_local_user -d ict_support_local -c "\dt"

# Test Neon connection
psql postgresql://neondb_owner:password@ep-xxx.neon.tech/neondb -c "\dt"

# Check if sync tables exist (they should be auto-created)
psql -U ict_local_user -d ict_support_local -c "\dt *sync*"
```

---

## 🚨 Common Sync Issues & Solutions

### Issue 1: Sync Disabled Even Though SYNC_ENABLED=true

**Cause:** One or both database URLs missing

**Solution:**

```env
# Both of these must be set:
DATABASE_URL=postgresql://...@localhost...      # Local
NEON_DATABASE_URL=postgresql://...@ep-xxx...    # Neon
```

### Issue 2: "Cannot Connect to Neon" in Logs

**Cause:** Internet unavailable or Neon connection invalid

**Solution:**

```powershell
# Test Neon connection manually
psql postgresql://YOUR_NEON_URL

# If fails: Check URL is correct
# If times out: Check internet connection
```

### Issue 3: Sync Running But Data Not Appearing

**Cause:** Sync is pull-only or one-way

**Solution:**

```env
# Change to bidirectional
SYNC_MODE=bidirectional

# Wait for next sync cycle (5 minutes default)
# Or restart backend to sync immediately
```

### Issue 4: Application Slow When Sync Runs

**Cause:** Sync interval too frequent

**Solution:**

```env
# Increase interval to 10 minutes
SYNC_INTERVAL=600000

# Or reduce interval if data needs to be fresher
SYNC_INTERVAL=120000  # 2 minutes
```

---

## 🔐 Best Practices

### ✅ DO:

- Use `bidirectional` mode in production
- Keep `SYNC_INTERVAL` between 2-10 minutes
- Enable `AUTO_SYNC=true` for hands-free operation
- Monitor console for sync messages
- Test offline mode periodically
- Back up both databases regularly

### ❌ DON'T:

- Use `pull` or `push` for critical data
- Set `SYNC_INTERVAL` too high (>15 min) if data is critical
- Change sync mode without restarting server
- Modify `backend/.env` while server is running
- Delete sync metadata from databases
- Assume changes sync immediately (5 min delay)

---

## 📈 Optimization Tips

### For Large Databases

If your database has many records:

```env
# Reduce sync frequency
SYNC_INTERVAL=900000          # 15 minutes instead of 5

# Consider: Archive old tickets separately
# This keeps active sync small and fast
```

### For Frequently Changing Data

If data changes often:

```env
# Increase sync frequency
SYNC_INTERVAL=120000          # 2 minutes instead of 5

# This keeps local & cloud in closer sync
```

### For Limited Bandwidth

If on slow internet:

```env
# Pull only mode (safer for slow connections)
SYNC_MODE=pull

# Or: Use push only and backup manually
SYNC_MODE=push
```

---

## 📞 Troubleshooting Checklist

Before contacting support:

- [ ] Check `SYNC_ENABLED=true` in `.env`
- [ ] Verify both `DATABASE_URL` and `NEON_DATABASE_URL` exist
- [ ] Check backend console for `[DBSync]` messages
- [ ] Test databases manually with `psql`
- [ ] Try restarting backend
- [ ] Check internet connection
- [ ] Verify PostgreSQL is running: `services.msc`

---

## 📚 Related Documentation

- [Server Setup Guide](SERVER_SETUP_GUIDE.md) - Complete setup
- [Quick Start](documentation/QUICK_START_LOCAL.md) - 5-minute setup
- [Local Network Setup](documentation/LOCAL_NETWORK_SETUP.md) - Network details

---

**Version:** 1.0  
**Last Updated:** 2026-06-09  
**Sync Tested:** ✅ Production Ready
