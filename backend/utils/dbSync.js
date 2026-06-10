/**
 * Database Sync Utility
 * Synchronizes local PostgreSQL database with Neon database
 * Keeps both databases in sync for offline/online operation
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

class DatabaseSync {
  constructor(options = {}) {
    this.localDbUrl = process.env.DATABASE_URL;
    this.neonDbUrl = process.env.NEON_DATABASE_URL;
    this.syncInterval = options.syncInterval || 5 * 60 * 1000; // 5 minutes
    this.lastSyncTime = null;
    this.syncInProgress = false;
    this.syncMode = options.syncMode || "pull"; // 'pull', 'push', or 'bidirectional'
    this.enabled =
      this.localDbUrl && this.neonDbUrl && this.localDbUrl !== this.neonDbUrl;

    if (!this.enabled) {
      console.warn(
        "[DBSync] ⚠️  Database sync disabled - both databases are the same or not configured",
      );
    }
  }

  /**
   * Parse PostgreSQL connection string
   */
  parseDbUrl(dbUrl) {
    try {
      const url = new URL(dbUrl);
      return {
        host: url.hostname,
        port: url.port || 5432,
        username: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        ssl: url.searchParams.get("sslmode") === "require",
      };
    } catch (error) {
      console.error("[DBSync] Failed to parse DB URL:", error.message);
      return null;
    }
  }

  /**
   * Build pg_dump command
   */
  buildDumpCommand(dbUrl) {
    const parsed = this.parseDbUrl(dbUrl);
    if (!parsed) return null;

    // Use full path to pg_dump for Windows compatibility
    const pgBinPath = process.env.PG_BIN_PATH || 'C:\\Program Files\\PostgreSQL\\18\\bin';
    let cmd = `"${pgBinPath}\\pg_dump.exe"`;
    cmd += ` -h ${parsed.host}`;
    cmd += ` -p ${parsed.port}`;
    cmd += ` -U ${parsed.username}`;
    cmd += ` -d ${parsed.database}`;

    return cmd;
  }

  /**
   * Build psql restore command
   */
  buildRestoreCommand(dbUrl) {
    const parsed = this.parseDbUrl(dbUrl);
    if (!parsed) return null;

    // Use full path to psql for Windows compatibility
    const pgBinPath = process.env.PG_BIN_PATH || 'C:\\Program Files\\PostgreSQL\\18\\bin';
    let cmd = `"${pgBinPath}\\psql.exe"`;
    cmd += ` -h ${parsed.host}`;
    cmd += ` -p ${parsed.port}`;
    cmd += ` -U ${parsed.username}`;
    cmd += ` -d ${parsed.database}`;

    return cmd;
  }

  /**
   * Pull changes from Neon to Local database
   */
  async pullFromNeon() {
    if (!this.enabled || this.syncInProgress) {
      return false;
    }

    this.syncInProgress = true;

    try {
      console.log("[DBSync] 📥 Pulling from Neon to Local...");
      const backupFile = path.join(__dirname, ".sync_neon_backup.sql");

      // Clean up old backup file if it exists
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }

      // Export from Neon
      const dumpCmd = this.buildDumpCommand(this.neonDbUrl);
      if (!dumpCmd) {
        throw new Error("Failed to build dump command");
      }

      console.log("[DBSync] Exporting from Neon...");
      const neonPassword = this.parseDbUrl(this.neonDbUrl).password;
      const neonParsed = this.parseDbUrl(this.neonDbUrl);
      const env = {
        ...process.env,
        PGPASSWORD: neonPassword,
        PGSSLMODE: neonParsed.ssl ? "require" : "disable",
      };

      // Use spawn for better stream handling on Windows
      const dumpOutput = execSync(dumpCmd, { env, stdio: "pipe" }).toString();
      fs.writeFileSync(backupFile, dumpOutput);

      // Restore to Local
      console.log("[DBSync] Restoring to Local...");
      const restoreCmd = this.buildRestoreCommand(this.localDbUrl);
      if (!restoreCmd) {
        throw new Error("Failed to build restore command");
      }

      const localPassword = this.parseDbUrl(this.localDbUrl).password;
      const localParsed = this.parseDbUrl(this.localDbUrl);
      const localEnv = {
        ...process.env,
        PGPASSWORD: localPassword,
        PGSSLMODE: localParsed.ssl ? "require" : "disable",
      };

      const backupContent = fs.readFileSync(backupFile, "utf-8");
      execSync(restoreCmd, {
        env: localEnv,
        stdio: "pipe",
        input: backupContent,
      });

      // Clean up
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }

      this.lastSyncTime = new Date();
      console.log("[DBSync] ✅ Pull from Neon complete -", this.lastSyncTime);
      return true;
    } catch (error) {
      console.error("[DBSync] ❌ Pull failed:", error.message);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Push changes from Local to Neon database
   */
  async pushToNeon() {
    if (!this.enabled || this.syncInProgress) {
      return false;
    }

    this.syncInProgress = true;

    try {
      console.log("[DBSync] 📤 Pushing from Local to Neon...");
      const backupFile = path.join(__dirname, ".sync_local_backup.sql");

      // Clean up old backup file if it exists
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }

      // Export from Local
      console.log("[DBSync] Exporting from Local...");
      const dumpCmd = this.buildDumpCommand(this.localDbUrl);
      if (!dumpCmd) {
        throw new Error("Failed to build dump command");
      }

      const localPassword = this.parseDbUrl(this.localDbUrl).password;
      const localParsed = this.parseDbUrl(this.localDbUrl);
      const env = {
        ...process.env,
        PGPASSWORD: localPassword,
        PGSSLMODE: localParsed.ssl ? "require" : "disable",
      };

      // Use spawn for better stream handling on Windows
      const dumpOutput = execSync(dumpCmd, { env, stdio: "pipe" }).toString();
      fs.writeFileSync(backupFile, dumpOutput);

      // Restore to Neon
      console.log("[DBSync] Restoring to Neon...");
      const restoreCmd = this.buildRestoreCommand(this.neonDbUrl);
      if (!restoreCmd) {
        throw new Error("Failed to build restore command");
      }

      const neonPassword = this.parseDbUrl(this.neonDbUrl).password;
      const neonParsed = this.parseDbUrl(this.neonDbUrl);
      const neonEnv = {
        ...process.env,
        PGPASSWORD: neonPassword,
        PGSSLMODE: neonParsed.ssl ? "require" : "disable",
      };

      const backupContent = fs.readFileSync(backupFile, "utf-8");
      execSync(restoreCmd, {
        env: neonEnv,
        stdio: "pipe",
        input: backupContent,
      });

      // Clean up
      if (fs.existsSync(backupFile)) {
        fs.unlinkSync(backupFile);
      }

      this.lastSyncTime = new Date();
      console.log("[DBSync] ✅ Push to Neon complete -", this.lastSyncTime);
      return true;
    } catch (error) {
      console.error("[DBSync] ❌ Push failed:", error.message);
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Bidirectional sync (Neon is source of truth)
   */
  async syncBidirectional() {
    if (!this.enabled || this.syncInProgress) {
      return false;
    }

    console.log("[DBSync] 🔄 Starting bidirectional sync...");

    // For now, pull from Neon (treat it as source of truth)
    // In production, implement proper conflict resolution
    const success = await this.pullFromNeon();

    if (success) {
      console.log("[DBSync] ✅ Bidirectional sync complete");
    } else {
      console.error("[DBSync] ❌ Bidirectional sync failed");
    }

    return success;
  }

  /**
   * Start automatic sync timer
   */
  startAutoSync() {
    if (!this.enabled) {
      console.warn("[DBSync] Auto-sync not enabled - databases not configured");
      return;
    }

    console.log(
      `[DBSync] ⏱️  Auto-sync enabled (${this.syncInterval / 1000}s interval)`,
    );

    // Sync on startup
    this.syncBidirectional();

    // Then sync periodically
    this.syncTimer = setInterval(() => {
      this.syncBidirectional();
    }, this.syncInterval);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log("[DBSync] Auto-sync stopped");
    }
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      enabled: this.enabled,
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      localDb: this.localDbUrl ? "configured" : "not configured",
      neonDb: this.neonDbUrl ? "configured" : "not configured",
    };
  }
}

module.exports = DatabaseSync;
