#!/bin/bash

# Script to disable cart-cleaner.js in HTML files

echo "🔧 Disabling cart-cleaner.js..."

# Backup files first
echo "📦 Creating backups..."
cp cart.html cart.html.backup 2>/dev/null && echo "✅ Backed up cart.html"
cp checkout.html checkout.html.backup 2>/dev/null && echo "✅ Backed up checkout.html"

# Comment out cart-cleaner.js in cart.html
if [ -f "cart.html" ]; then
    sed -i.bak 's/<script src="cart-cleaner.js"><\/script>/<!-- <script src="cart-cleaner.js"><\/script> -->/' cart.html
    echo "✅ Disabled cart-cleaner.js in cart.html"
fi

# Comment out cart-cleaner.js in checkout.html
if [ -f "checkout.html" ]; then
    sed -i.bak 's/<script src="cart-cleaner.js"><\/script>/<!-- <script src="cart-cleaner.js"><\/script> -->/' checkout.html
    echo "✅ Disabled cart-cleaner.js in checkout.html"
fi

echo ""
echo "✅ Cart cleaner disabled!"
echo "🎉 Products will no longer be removed from cart"
echo ""
echo "To restore, run: mv cart.html.backup cart.html && mv checkout.html.backup checkout.html"
