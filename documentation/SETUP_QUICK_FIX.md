# Quick Setup Fix - ICT Support Desk

## ⚠️ Important: Password Clarification

The setup script asks for **TWO different passwords**:

### 1️⃣ PostgreSQL Admin Password (What to enter in setup script)

- **What it is:** The password you set during PostgreSQL installation
- **Default:** Usually left blank OR you set a custom password
- **Your password:** `sola#2020sql` (based on your .env file)

### 2️⃣ Local Database User Password (Created by script)

- **What it is:** Password for the new `ict_local_user` account created by the script
- **This is:** `local_password` (hardcoded in the script)
- **You don't enter this:** The script creates it automatically

---

## If Manual Setup Already Done

If you already created the database manually, skip the setup script and do this:

### Step 1: Create/Update `.env` file

Edit `backend/.env` with:

```env
NODE_ENV=development
PORT=5000

# Development Database
DATABASE_URL=postgresql://ict_local_user:local_password@localhost:5432/ict_support_local

# Production Database (add your actual Neon URL)
NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require

# Network Configuration
CORS_ORIGIN=http://localhost:5173,http://10.31.36.125:5173,http://ict.local:5173
CLIENT_URLS=http://localhost:5173,http://10.31.36.125:5173,http://ict.local:5173

# Firebase
JWT_SECRET=ict_desk_super_secret_2024
FIREBASE_SERVICE_ACCOUNT_JSON=./utils/service-account.json
FIREBASE_PROJECT_ID=ict-helpdesk-e983c
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ict-helpdesk-e983c.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=... (copy from your existing .env)

# Cloudinary
CLOUDINARY_CLOUD_NAME=dpgx5dvyr
CLOUDINARY_API_KEY=436475286928488
CLOUDINARY_API_SECRET=WXz2JnNPW3vrQqhnJiP_W2Ge1GM
```

### Step 2: Install Dependencies

```powershell
cd backend
npm install
cd ..

cd frontend
npm install
cd ..
```

### Step 3: Run Prisma Migrations

```powershell
cd backend
npx prisma migrate deploy
cd ..
```

### Step 4: Start the Application

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Troubleshooting

**Error: "connection to server at "localhost"... authentication failed"**

- ✅ Check your PostgreSQL admin password (likely `sola#2020sql`)
- ✅ Ensure PostgreSQL service is running
- ✅ Try: Win+R → `services.msc` → Find "PostgreSQL" → Check if running

**Error: "database ict_support_local does not exist"**

- ✅ You need to create it manually (see below)
- ✅ Or run the setup script with correct postgres admin password

**Manual Database Creation (if needed):**

```powershell
# Open PowerShell
psql -U postgres -h 127.0.0.1

# Then enter your postgres password (sola#2020sql)
# Paste these commands:

CREATE DATABASE ict_support_local;
CREATE USER ict_local_user WITH PASSWORD 'local_password';
ALTER USER ict_local_user WITH PASSWORD 'local_password';
GRANT ALL PRIVILEGES ON DATABASE ict_support_local TO ict_local_user;

# Exit
\q
```

---

## Your Network Access

- **Local (this PC):** http://localhost:5173
- **From other PCs:** http://10.31.36.125:5173
- **mDNS (if Bonjour installed):** http://ict.local:5173
