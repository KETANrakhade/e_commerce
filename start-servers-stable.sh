#!/bin/bash

echo "🚀 Starting Pyramid E-Commerce Servers (Stable Version)"
echo "================================================"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if MongoDB is running
echo "📊 Checking MongoDB..."
if mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running!"
    echo "   Please start MongoDB first"
    exit 1
fi

echo ""

# Check if backend port is already in use
if check_port 5001; then
    echo "⚠️  Port 5001 is already in use. Stopping existing process..."
    pkill -f "node.*server.js" || true
    sleep 2
fi

# Check if admin panel port is already in use
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. Stopping existing process..."
    pkill -f "php.*localhost:8000" || true
    sleep 2
fi

echo "🔧 Starting Backend Server (Port 5001)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

echo "👨‍💼 Starting Admin Panel (Port 8000)..."
cd pyramid-admin
php -S localhost:8000 &
ADMIN_PID=$!
cd ..

sleep 2

# Verify servers are running
echo ""
echo "🔍 Verifying servers..."

if curl -s -f http://localhost:5001/api/products > /dev/null; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API is not responding"
fi

if curl -s -f http://localhost:8000 > /dev/null; then
    echo "✅ Admin Panel is responding"
else
    echo "❌ Admin Panel is not responding"
fi

echo ""
echo "================================================"
echo "  ✅ SERVERS STARTED SUCCESSFULLY!"
echo "================================================"
echo ""
echo "📍 Access Points:"
echo "   • Backend API:    http://localhost:5001/api"
echo "   • Admin Panel:    http://localhost:8000"
echo "   • Customer Site:  Open index.html in browser"
echo ""
echo "🔐 Admin Login:"
echo "   Email:    admin@admin.com"
echo "   Password: admin123"
echo ""
echo "⚠️  Note: PDF export is temporarily disabled"
echo "   Use CSV export instead until PDF is fixed"
echo ""
echo "================================================"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $ADMIN_PID 2>/dev/null; exit" INT
wait