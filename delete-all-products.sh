#!/bin/bash

# Script to delete all products from the database
API_BASE="http://localhost:5001/api"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTQxYWQ0YzYxMmJiN2NlMDZlMjMxNyIsImlhdCI6MTc2ODIwMzkwNSwiZXhwIjoxNzcwNzk1OTA1fQ.0KwfDrXEAJMl-YlxupyK1vbrKl-hkO3--oV0OScR5ck"

echo "🗑️  Starting bulk product deletion..."
echo ""

# Get all product IDs
echo "📋 Fetching all products..."
PRODUCTS=$(curl -s "${API_BASE}/admin/products?limit=100" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json")

# Extract product IDs using Python
PRODUCT_IDS=$(echo "$PRODUCTS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if data.get('success') and 'data' in data:
        products = data['data'].get('products', [])
        for product in products:
            print(product['_id'])
except:
    pass
")

if [ -z "$PRODUCT_IDS" ]; then
    echo "❌ No products found or failed to fetch products"
    exit 1
fi

# Count products
PRODUCT_COUNT=$(echo "$PRODUCT_IDS" | wc -l | tr -d ' ')
echo "📦 Found $PRODUCT_COUNT products to delete"
echo ""

echo "🚨 WARNING: This will PERMANENTLY delete all products from the database!"
echo "Press Ctrl+C to cancel, or press Enter to continue..."
read -r

echo ""
echo "🗑️  Starting deletion..."
echo ""

DELETED_COUNT=0
FAILED_COUNT=0

# Delete each product
for PRODUCT_ID in $PRODUCT_IDS; do
    if [ ! -z "$PRODUCT_ID" ]; then
        echo -n "Deleting product $PRODUCT_ID... "
        
        RESPONSE=$(curl -s -w "%{http_code}" \
          -X DELETE "${API_BASE}/admin/products/${PRODUCT_ID}" \
          -H "Authorization: Bearer ${ADMIN_TOKEN}" \
          -H "Content-Type: application/json")
        
        HTTP_CODE="${RESPONSE: -3}"
        RESPONSE_BODY="${RESPONSE%???}"
        
        if [ "$HTTP_CODE" = "200" ]; then
            echo "✅ Success"
            DELETED_COUNT=$((DELETED_COUNT + 1))
        else
            echo "❌ Failed (HTTP $HTTP_CODE)"
            FAILED_COUNT=$((FAILED_COUNT + 1))
        fi
        
        # Small delay between requests
        sleep 0.1
    fi
done

echo ""
echo "📊 Deletion Summary:"
echo "✅ Successfully deleted: $DELETED_COUNT products"
echo "❌ Failed to delete: $FAILED_COUNT products"
echo "📦 Total processed: $PRODUCT_COUNT products"

if [ $DELETED_COUNT -gt 0 ]; then
    echo ""
    echo "🎉 Products have been permanently deleted from the database!"
fi