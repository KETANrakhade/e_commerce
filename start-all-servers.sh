#!/bin/bash

echo "🚀 Starting Pyramid E-Commerce Project..."
echo ""
echo "================================================"
echo "  PYRAMID E-COMMERCE - SERVER STARTUP"
echo "================================================"
echo ""

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
echo "🔧 Starting Backend Server (Port 5001)..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

sleep 3

echo ""
echo "👨‍💼 Starting Admin Panel (Port 8000)..."
cd pyramid-admin
php -S localhost:8000 &
ADMIN_PID=$!
cd ..

sleep 2

echo ""
echo "================================================"
echo "  ✅ ALL SERVERS STARTED!"
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
echo "================================================"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $ADMIN_PID; exit" INT
wait
