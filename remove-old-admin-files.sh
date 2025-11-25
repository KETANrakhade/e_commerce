#!/bin/bash

# Script to remove old admin panel files
# These files are no longer needed since pyramid-admin is the current admin panel

echo "🗑️  Removing old admin panel files..."
echo ""

# Files to delete
FILES=(
    "admin.html"
    "admin-script.js"
    "admin-redirect.html"
    "admin-setup.html"
)

# Delete each file
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo "✅ Deleted: $file"
    else
        echo "ℹ️  Not found: $file (may have been deleted already)"
    fi
done

echo ""
echo "✅ Old admin panel files cleanup complete!"
echo ""
echo "📁 Current admin panel: pyramid-admin/ (http://localhost:8000)"
echo "🔧 Admin login: http://localhost:8000/login.php"








