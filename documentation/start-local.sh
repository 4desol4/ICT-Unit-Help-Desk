#!/bin/bash

# ============================================================
# ICT Support Desk - Local Mode Startup Script (macOS/Linux)
# Starts both backend and frontend for local network access
# ============================================================

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  ICT Support Desk - Local Mode Startup                ║"
echo "║  Both backend and frontend will run locally            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if setup is complete
if [ ! -f "backend/.env" ]; then
    echo "❌ backend/.env not found!"
    echo ""
    echo "Please run ./setup-local.sh first to configure."
    exit 1
fi

if [ ! -d "backend/node_modules" ]; then
    echo "❌ Backend dependencies not installed!"
    echo ""
    echo "Please run ./setup-local.sh first."
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend dependencies not installed!"
    echo ""
    echo "Please run ./setup-local.sh first."
    exit 1
fi

# Check PostgreSQL
echo "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not running or not installed"
    exit 1
fi
echo "✅ PostgreSQL available"

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    HOSTNAME=$(scutil --get ComputerName)
else
    # Linux
    IP=$(hostname -I | awk '{print $1}')
    HOSTNAME=$(hostname)
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "Starting ICT Support Desk in LOCAL MODE..."
echo "════════════════════════════════════════════════════════"
echo ""
echo "Access the app at:"
echo "   - Local:    http://localhost:5173"
echo "   - Network:  http://$IP:5173"
echo "   - mDNS:     http://$HOSTNAME.local:5173"
echo ""
echo "Backend API:  http://localhost:5000"
echo "Database sync will start automatically"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "════════════════════════════════════════════════════════"
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Start backend
echo "Starting backend server on port 5000..."
cd backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend server on port 5173..."
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers started!"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "View logs with:"
echo "   tail -f logs/backend.log"
echo "   tail -f logs/frontend.log"
echo ""
echo "To stop the servers, run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user input to exit
read -p "Press Enter to exit (servers will keep running)..."

echo ""
echo "Servers are still running!"
echo "Use: kill $BACKEND_PID $FRONTEND_PID  to stop them"
echo ""
