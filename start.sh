#!/bin/bash

echo "🚀 Starting PYRAMID E-Commerce Platform..."
echo "========================================"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   macOS: brew services start mongodb-community"
    echo "   Ubuntu: sudo systemctl start mongod"
    echo "   Windows: net start MongoDB"
    exit 1
fi

echo "✅ MongoDB is running"

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed (if using Node.js server)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install express
fi

# Seed database if needed
echo "🌱 Seeding database with sample data..."
cd backend && npm run seed && cd ..

echo ""
echo "🎉 Setup complete! Starting servers..."
echo ""

# Start backend server in background
echo "🔧 Starting backend server on http://localhost:5001..."
cd backend && npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server on http://localhost:8080..."
python3 serve.py &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait