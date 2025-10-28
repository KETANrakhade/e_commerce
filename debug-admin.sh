#!/bin/bash

echo "🔍 Debugging Admin Panel Access..."
echo "=================================="

# Check current directory
echo "📁 Current directory: $(pwd)"
echo ""

# Check if E-COMMERCE-PYRAMID folder exists
echo "1. Checking E-COMMERCE-PYRAMID folder..."
if [ -d "E-COMMERCE-PYRAMID" ]; then
    echo "✅ E-COMMERCE-PYRAMID folder found"
    echo "   Contents:"
    ls -la E-COMMERCE-PYRAMID/ | head -10
else
    echo "❌ E-COMMERCE-PYRAMID folder not found in current directory"
    echo "   Available folders:"
    ls -la | grep "^d"
fi

echo ""

# Check if backend folder exists
echo "2. Checking backend folder..."
if [ -d "backend" ]; then
    echo "✅ Backend folder found"
    if [ -f "backend/server.js" ]; then
        echo "✅ server.js found"
    else
        echo "❌ server.js not found in backend folder"
    fi
else
    echo "❌ Backend folder not found"
fi

echo ""

# Check if MongoDB is running
echo "3. Checking MongoDB..."
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running"
    echo "   Starting MongoDB..."
    brew services start mongodb-community@6.0
    sleep 2
fi

echo ""

# Check if ports are available
echo "4. Checking ports..."
if lsof -i :5000 > /dev/null 2>&1; then
    echo "⚠️  Port 5000 is already in use:"
    lsof -i :5000
else
    echo "✅ Port 5000 is available"
fi

if lsof -i :8080 > /dev/null 2>&1; then
    echo "⚠️  Port 8080 is already in use:"
    lsof -i :8080
else
    echo "✅ Port 8080 is available"
fi

echo ""

# Try to start backend manually
echo "5. Testing backend startup..."
cd backend
if node -e "console.log('Node.js is working')" 2>/dev/null; then
    echo "✅ Node.js is working"
else
    echo "❌ Node.js is not working properly"
fi

# Check if all dependencies are installed
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    if [ -d "node_modules" ]; then
        echo "✅ node_modules found"
    else
        echo "❌ node_modules not found - running npm install..."
        npm install
    fi
else
    echo "❌ package.json not found in backend"
fi

cd ..

echo ""

# Try to start PHP server manually
echo "6. Testing PHP server..."
cd E-COMMERCE-PYRAMID
if php -v > /dev/null 2>&1; then
    echo "✅ PHP is installed"
    php -v | head -1
else
    echo "❌ PHP is not installed or not in PATH"
fi

cd ..

echo ""
echo "🚀 Manual startup commands:"
echo "   Backend: cd backend && node server.js"
echo "   Admin:   cd E-COMMERCE-PYRAMID && php -S localhost:8080"