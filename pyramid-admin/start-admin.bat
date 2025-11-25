@echo off
echo 🏛️  Starting Pyramid Admin Panel...
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Create admin user
echo 👤 Creating admin user...
node create-admin-user.js

REM Start the backend server
echo 🚀 Starting backend server...
echo Backend will run on: http://localhost:5000
echo Admin panel: http://localhost/pyramid-admin/login.php
echo.
echo Login credentials:
echo Email: admin@admin.com
echo Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo ==================================

node backend/server.js