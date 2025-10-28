#!/bin/bash

# Setup script for XAMPP Admin Panel

echo "🚀 Setting up E-Commerce Admin Panel for XAMPP..."

# Default XAMPP htdocs path (adjust if different)
XAMPP_HTDOCS="/Applications/XAMPP/htdocs"

# Check if XAMPP htdocs exists
if [ ! -d "$XAMPP_HTDOCS" ]; then
    echo "❌ XAMPP htdocs directory not found at $XAMPP_HTDOCS"
    echo "Please update the XAMPP_HTDOCS path in this script"
    exit 1
fi

# Create admin directory in XAMPP
ADMIN_DIR="$XAMPP_HTDOCS/pyramid-admin"

echo "📁 Creating admin directory: $ADMIN_DIR"
mkdir -p "$ADMIN_DIR"

# Copy admin panel files
echo "📋 Copying admin panel files..."
cp -r E-COMMERCE-PYRAMID/* "$ADMIN_DIR/"

# Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 "$ADMIN_DIR"
chmod 644 "$ADMIN_DIR/.htaccess"

echo "✅ Setup complete!"
echo ""
echo "🌐 Access your admin panel at:"
echo "   http://localhost/pyramid-admin/login.php"
echo ""
echo "🔑 Login credentials:"
echo "   Email: admin@pyramid.com"
echo "   Password: pyramid123"
echo ""
echo "📝 To change the password, edit:"
echo "   $ADMIN_DIR/config/admin_config.php"
echo ""
echo "🚀 Make sure XAMPP Apache is running!"