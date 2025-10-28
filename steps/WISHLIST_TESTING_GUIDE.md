# 🧪 Wishlist Testing Guide

## ✅ **How to Test Wishlist Functionality**

### **For product.html (Men's Products):**

1. **Navigate to Men's Section**:
   - Go to your website
   - Click on "Men" in the navigation
   - This takes you to `men-product.html`

2. **Select a Product**:
   - Click on any product image/card
   - This will take you to `product.html?id=X` (where X is the product ID)

3. **Test Wishlist Button**:
   - Look for the "WISHLIST" button with heart icon
   - Click the button
   - Should see alert "Item added to wishlist!"
   - Button should change to "ADDED TO WISHLIST" with filled heart
   - Button should be disabled and change color

4. **Check Wishlist Page**:
   - Click the heart icon in the navigation (top right)
   - Should see the product in your wishlist
   - Can remove item or add to cart from there

### **For women-item.html (Women's Products):**

1. **Navigate to Women's Section**:
   - Click on "Women" in the navigation
   - This takes you to `women-product.html`

2. **Select a Product**:
   - Click on any product image/card
   - This takes you to `women-item.html?id=X`

3. **Test Wishlist Button**:
   - Same process as men's products
   - Button will be pink/rose colored instead of blue

### **Direct Testing (if needed):**

If you want to test `product.html` directly:
- Go to: `product.html?id=1` (or any number 1-6)
- Or just go to `product.html` (will default to first product)

## 🔧 **What Should Happen:**

### **When Adding to Wishlist:**
1. ✅ Alert: "Item added to wishlist!"
2. ✅ Button changes to filled heart + "ADDED TO WISHLIST"
3. ✅ Button becomes disabled
4. ✅ Button color changes (blue for men's, pink for women's)
5. ✅ Wishlist badge in navigation shows count

### **When Viewing Wishlist:**
1. ✅ Items display in modern card layout
2. ✅ Shows product image, name, and price
3. ✅ "Remove from Wishlist" button works
4. ✅ "Add to Cart" button works
5. ✅ Badge updates when items removed

### **Duplicate Prevention:**
1. ✅ If item already in wishlist, shows "Item already in wishlist!"
2. ✅ Button shows "IN WISHLIST" if already added
3. ✅ Button is disabled for items already in wishlist

## 🐛 **If It's Not Working:**

### **Check Console for Errors:**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any JavaScript errors
4. Should see logs when button is clicked

### **Common Issues:**
1. **Button not clickable**: Check if button has `id="wishlistBtn"`
2. **No product found**: Make sure you're accessing with `?id=X` parameter
3. **Function not defined**: Check if `addToWishlist` function exists
4. **Storage issues**: Check if localStorage is enabled

### **Manual Test:**
Open browser console and run:
```javascript
// Test if product exists
console.log('Product:', window.product);

// Test if function exists
console.log('Function:', typeof addToWishlist);

// Test wishlist storage
console.log('Wishlist:', localStorage.getItem('wishlist_v1'));
```

## 📱 **Cross-Page Testing:**

1. **Add items from both pages** (men's and women's)
2. **Check wishlist page** shows all items
3. **Navigate between pages** and check badge updates
4. **Remove items** and verify badge decreases
5. **Add to cart** from wishlist and check cart page

## ✅ **Success Criteria:**

- ✅ Wishlist button works on both product.html and women-item.html
- ✅ Items persist in localStorage between sessions
- ✅ Wishlist badge shows correct count
- ✅ Wishlist page displays items correctly
- ✅ Can remove items from wishlist
- ✅ Can add items to cart from wishlist
- ✅ No duplicate items in wishlist
- ✅ Visual feedback for all actions

**The wishlist functionality should now be 100% working!** 💖