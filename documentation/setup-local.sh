#!/bin/bash

# ============================================================
# ICT Support Desk - Local Network Setup Script (macOS/Linux)
# ============================================================

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ICT Support Desk - Local Network Setup Helper        ║"
echo "║   This script will help you configure for local play   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    echo "   macOS: brew install node"
    echo "   Linux: apt-get install nodejs npm"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check if PostgreSQL is installed
echo ""
echo "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Please install PostgreSQL first."
    echo "   macOS: brew install postgresql"
    echo "   Ubuntu/Debian: apt-get install postgresql postgresql-contrib"
    exit 1
fi
echo "✅ PostgreSQL found: $(psql --version)"

# Get network IP
echo ""
echo "────────────────────────────────────────────────────────"
echo "STEP 1: Network Configuration"
echo "────────────────────────────────────────────────────────"
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    HOSTNAME=$(scutil --get ComputerName)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
    HOSTNAME=$(hostname)
fi

echo "Your Network IP: $IP"
echo "Your Hostname: $HOSTNAME"
echo ""
echo "Use this IP to access the app from other computers:"
echo "   Browser: http://$IP:5173"
echo ""
echo "Your mDNS hostname:"
echo "   Browser: http://$HOSTNAME.local:5173"
echo ""

# Ask for PostgreSQL password
echo ""
echo "────────────────────────────────────────────────────────"
echo "STEP 2: PostgreSQL Configuration"
echo "────────────────────────────────────────────────────────"
echo ""

read -sp "Enter PostgreSQL postgres user password: " PG_PASSWORD
echo ""

# Create local database
echo ""
echo "Creating local database..."
PGPASSWORD="$PG_PASSWORD" psql -U postgres -h localhost <<EOF
CREATE DATABASE ict_support_local;
CREATE USER ict_local_user WITH PASSWORD 'local_password';
ALTER USER ict_local_user WITH PASSWORD 'local_password';
GRANT ALL PRIVILEGES ON DATABASE ict_support_local TO ict_local_user;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database created"
else
    echo "❌ Database creation failed"
    exit 1
fi

# Create .env file
echo ""
echo "────────────────────────────────────────────────────────"
echo "STEP 3: Backend Configuration"
echo "────────────────────────────────────────────────────────"
echo ""

if [ -f "backend/.env" ]; then
    echo "⚠️  backend/.env already exists"
    read -p "Overwrite it? (y/n): " -n 1 -r OVERWRITE
    echo ""
    if [[ ! $OVERWRITE =~ ^[Yy]$ ]]; then
        echo "Skipping .env creation"
    else
        CREATE_ENV=true
    fi
else
    CREATE_ENV=true
fi

if [ "$CREATE_ENV" = true ]; then
    echo "Creating backend/.env..."
    cat > backend/.env <<EOF
# Server Configuration
NODE_ENV=development
PORT=5000

# LOCAL DATABASE (Primary)
DATABASE_URL=postgresql://ict_local_user:local_password@localhost:5432/ict_support_local

# NEON DATABASE (For syncing - copy from your Neon dashboard)
NEON_DATABASE_URL=postgresql://neon_user:neon_password@ep-xxx.neon.tech/ict_support_desk?sslmode=require

# Network Configuration
CORS_ORIGIN=http://localhost:5173,http://$IP:5173,http://$HOSTNAME.local:5173
CLIENT_URLS=http://localhost:5173,http://$IP:5173,http://$HOSTNAME.local:5173

# Firebase
JWT_SECRET=your-jwt-secret-here
FIREBASE_SERVICE_ACCOUNT_JSON=./firebase-service-account.json

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF
    echo "✅ .env created at backend/.env"
    echo "   📝 Please edit it with your actual credentials"
fi

# Install dependencies
echo ""
echo "────────────────────────────────────────────────────────"
echo "STEP 4: Installing Dependencies"
echo "────────────────────────────────────────────────────────"
echo ""

echo "Installing backend dependencies..."
cd backend
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend npm install failed"
    cd ..
    exit 1
fi
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend npm install failed"
    cd ..
    exit 1
fi
cd ..

# Database setup
echo ""
echo "────────────────────────────────────────────────────────"
echo "STEP 5: Database Setup"
echo "────────────────────────────────────────────────────────"
echo ""
echo "Running Prisma migrations..."
cd backend
npx prisma migrate deploy > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database tables created"
else
    echo "⚠️  Prisma migrations had issues - you may need to fix .env"
fi
cd ..

# Final instructions
echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ Setup Complete!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Edit backend/.env with your actual Neon database URL"
echo "   (Copy from: Neon Dashboard → Connection String)"
echo ""
echo "2. Run the startup script:"
echo "   chmod +x start-local.sh"
echo "   ./start-local.sh"
echo ""
echo "ACCESSING THE APP:"
echo ""
echo "From this computer:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:5000"
echo ""
echo "From other computers on same network:"
echo "   - Frontend: http://$IP:5173"
echo "   - Or: http://$HOSTNAME.local:5173"
echo ""
echo "DATABASE SYNCING:"
echo "   - Local and Neon databases will auto-sync every 5 minutes"
echo "   - Check backend console for sync status"
echo ""
echo "════════════════════════════════════════════════════════"
echo ""
