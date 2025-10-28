#!/bin/bash

echo "🏛️  Starting Pyramid Admin Panel..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    if command -v brew &> /dev/null; then
        brew services start mongodb-community
    else
        echo "Please start MongoDB manually: mongod"
        exit 1
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create admin user if it doesn't exist
echo "👤 Creating admin user..."
node create-admin-user.js

# Start the backend server
echo "🚀 Starting backend server..."
echo "Backend will run on: http://localhost:5000"
echo "Admin panel: http://localhost/pyramid-admin/login.php"
echo ""
echo "Login credentials:"
echo "Email: admin@admin.com"
echo "Password: admin123"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

node backend/server.js