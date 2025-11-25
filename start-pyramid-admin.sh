#!/bin/bash

# Pyramid Admin Startup Script
# This script starts the PHP server for the admin panel

echo "🚀 Starting Pyramid Admin Panel..."
echo ""
echo "📍 Admin Panel will be available at: http://localhost:8000"
echo "🔐 Default Login:"
echo "   Email: admin@admin.com"
echo "   Password: admin123"
echo ""
echo "⚠️  Make sure your Node.js backend is running on port 5001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd pyramid-admin
php -S localhost:8000
