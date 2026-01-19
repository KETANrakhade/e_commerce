# Quick Start: Out of Stock Feature

## 🚀 Quick Test (2 minutes)

### Step 1: Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Admin Panel
cd pyramid-admin
php -S localhost:8000

# Terminal 3 - Frontend
python3 serve.py
```

### Step 2: Test the Feature
1. Open: `http://localhost:8080/test-out-of-stock.html`
2. Click: **"Create Test Out-of-Stock Product"**
3. Click: **"View Product"** (opens in new tab)
4. ✅ You should see:
   - Red "OUT OF STOCK" badge
   - Greyed out images
   - Disabled "Add to Cart" button
   - Alert message

### Step 3: Test on Listing Pages
1. Go to: `http://localhost:8080/men-product.html`
2. Look for products with red "OUT OF STOCK" badge
3. Notice greyed out images
4. Click on card - still opens detail page

## 📝 How to Mark Products Out of Stock

### Method 1: Admin Panel (Easiest)
1. Go to: `http://localhost:8000/pyramid-admin`
2. Login: `admin@pyramid.com` / `admin123`
3. Click: **Products** in sidebar
4. Click: **Edit** (pencil icon) on any product
5. Find: **Stock** field
6. Set to: `0`
7. Click: **Update Product**
8. Done! ✅

### Method 2: Test Page (Fastest)
1. Go to: `http://localhost:8080/test-out-of-stock.html`
2. Click: **"Fetch All Products"**
3. Find any product
4. Click: **"Set Stock to 0"**
5. Click: **"View Product"**
6. Done! ✅

### Method 3: API (For Developers)
```javascript
// Update product stock via API
const productId = 'YOUR_PRODUCT_ID';
const token = localStorage.getItem('adminToken');

fetch(`http://localhost:5001/api/products/${productId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ stock: 0 })
});
```

## 🎨 What You'll See

### Product Detail Page
```
┌─────────────────────────────────┐
│ ⚠️ OUT OF STOCK (red badge)    │
│                                  │
│ [Greyed Out Images]             │
│                                  │
│ Product Name                     │
│ ₹999                            │
│                                  │
│ ❌ This product is currently    │
│    unavailable                   │
│                                  │
│ [❌ OUT OF STOCK] (disabled)    │
└─────────────────────────────────┘
```

### Product Listing
```
┌──────────────────┐
│ [OUT OF STOCK]   │ ← Red badge
│                  │
│ [Greyed Image]   │
│                  │
│ Product Name     │
│ ₹999            │
└──────────────────┘
```

## ✅ Checklist

After implementation, verify:

**Product Detail Page:**
- [ ] Badge visible when stock = 0
- [ ] Images greyed out
- [ ] Button disabled
- [ ] Alert message shows
- [ ] Cannot add to cart

**Product Listings:**
- [ ] Badge on card
- [ ] Image greyed out
- [ ] Card still clickable
- [ ] Badge animates (pulse)

**Functionality:**
- [ ] Works on men's page
- [ ] Works on women's page
- [ ] Works on mobile
- [ ] Wishlist still works

## 🐛 Troubleshooting

### Badge Not Showing?
- Check: Product has `stock: 0` in database
- Try: Hard refresh (Cmd + Shift + R)
- Verify: Backend running on port 5001

### Images Not Greyed?
- Check: Browser console for errors
- Try: Clear cache
- Verify: CSS loaded properly

### Button Still Clickable?
- Check: JavaScript console for errors
- Try: Refresh page
- Verify: `disabled` attribute on button

### Stock Field Missing?
- Check: Product model has `stock` field
- Default: Products have `stock: 0` by default
- Update: Edit product in admin panel

## 📚 Documentation

- **Full Details:** `OUT_OF_STOCK_FEATURE.md`
- **Visual Guide:** `OUT_OF_STOCK_VISUAL_GUIDE.md`
- **Summary:** `OUT_OF_STOCK_IMPLEMENTATION_SUMMARY.md`
- **Test Page:** `test-out-of-stock.html`

## 🎯 Key Points

1. **Stock = 0** triggers out-of-stock UI
2. **Works everywhere:** Detail page, men's page, women's page
3. **User-friendly:** Clear visual indicators
4. **Still functional:** Can view details, add to wishlist
5. **No breaking changes:** Existing features work normally

## 💡 Tips

- Use test page for quick testing
- Set stock to 0 to test, set to any number > 0 to restore
- Badge pulses to draw attention
- Images are greyed but still visible
- Users can still browse and wishlist items

---

**Need Help?** Check the full documentation files or test using `test-out-of-stock.html`
