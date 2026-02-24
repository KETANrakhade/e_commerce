# Trending Feature Implementation

## Overview
Added a "Trending" feature that allows admins to mark products as trending from the admin panel. Trending products display a special badge on the frontend product cards.

## Changes Made

### 1. Backend - Database Schema
**File:** `backend/models/productModel.js`
- Added `trending: { type: Boolean, default: false }` field to product schema
- Added index for trending field for better query performance
- Field is already in place from previous work

### 2. Admin Panel - Product Form
**File:** `pyramid-admin/pages/products.php`

#### Add Product Form (Line ~250):
```php
'trending' => isset($_POST['trending']) ? true : false
```

#### Edit Product Form (Line ~677):
```php
'trending' => isset($_POST['trending']),
```

#### UI Checkbox (Line ~1893):
```html
<div class="col-sm-6">
    <div class="form-check mb-3">
        <input class="form-check-input" type="checkbox" id="trending" name="trending" 
               <?php echo (!empty($product['trending'])) ? 'checked' : ''; ?>>
        <label class="form-check-label" for="trending">Trending Product</label>
    </div>
</div>
```

### 3. Frontend - Men's Products
**File:** `men-products-loader.js`

#### Badge Logic (Line ~253):
```javascript
let trendingBadge = ''; // Trending badge

// Check if product is trending
if (product.trending) {
    trendingBadge = `<div class="trending-badge">🔥 Trending</div>`;
}
```

#### Product Card HTML (Line ~288):
```javascript
<div class="product-image-container">
    ${saleBadge}
    ${trendingBadge}
    <img src="${imageUrl}" ...>
```

**File:** `men-product.html`

#### CSS Styling (Line ~795):
```css
.trending-badge {
    position: absolute;
    top: 60px;
    left: 15px;
    background: linear-gradient(135deg, #FF6B35, #F7931E);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    z-index: 10;
    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    animation: trendingPulse 2s ease-in-out infinite;
}

@keyframes trendingPulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6);
    }
}
```

### 4. Frontend - Women's Products
**File:** `women-products-loader.js`
- Same changes as men's products loader

**File:** `women-product.html`
- Same CSS styling as men's product page

## Features

### Admin Panel
- ✅ Checkbox to mark product as "Trending" in add/edit product form
- ✅ Checkbox appears next to "Featured Product" checkbox
- ✅ Works for both creating new products and editing existing products
- ✅ Trending status is saved to database

### Frontend Display
- ✅ Trending badge displays on product cards with 🔥 emoji
- ✅ Badge positioned below sale badge (if present)
- ✅ Orange gradient background (#FF6B35 to #F7931E)
- ✅ Pulsing animation to draw attention
- ✅ Responsive design
- ✅ Works on both men's and women's product pages

## Badge Positioning
- **Sale Badge:** Top-left corner (red)
- **Trending Badge:** Below sale badge, left side (orange gradient)
- **Out of Stock Badge:** Top-right corner (red)

## Testing Steps

1. **Admin Panel:**
   - Go to admin panel (http://localhost:9000)
   - Navigate to Products page
   - Click "Add Product" or edit existing product
   - Check the "Trending Product" checkbox
   - Save the product

2. **Frontend:**
   - Visit men's products page (men-product.html)
   - Visit women's products page (women-product.html)
   - Verify trending badge appears on marked products
   - Verify badge animation works
   - Verify badge doesn't overlap with other badges

## Design Choices

1. **Badge Style:** Orange gradient with fire emoji (🔥) to indicate "hot" trending items
2. **Animation:** Subtle pulsing effect to draw attention without being distracting
3. **Position:** Below sale badge to avoid overlap, maintains visual hierarchy
4. **Typography:** Uppercase, bold, with letter spacing for emphasis

## Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Future Enhancements (Optional)
- Add trending filter in product listing
- Sort by trending products
- Auto-expire trending status after X days
- Trending analytics dashboard
- Trending products section on homepage
