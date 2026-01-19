# Out of Stock Feature - Testing Checklist

## Pre-Testing Setup

### 1. Start All Servers
- [ ] Backend running on `http://localhost:5001`
- [ ] Admin panel running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:8080`

### 2. Login Credentials Ready
- [ ] Admin: `admin@pyramid.com` / `admin123`
- [ ] User account (if needed for testing)

### 3. Browser Ready
- [ ] Using Chrome, Firefox, Safari, or Edge
- [ ] Developer tools open (F12)
- [ ] Console tab visible for debugging

---

## Test 1: Create Out-of-Stock Product

### Using Test Page (Recommended)
- [ ] Open `http://localhost:8080/test-out-of-stock.html`
- [ ] Click "Create Test Out-of-Stock Product"
- [ ] See success message
- [ ] Click "View Product" link
- [ ] Product detail page opens

### Using Admin Panel (Alternative)
- [ ] Go to `http://localhost:8000/pyramid-admin`
- [ ] Login as admin
- [ ] Click "Products" in sidebar
- [ ] Click "Edit" on any product
- [ ] Set "Stock" field to `0`
- [ ] Click "Update Product"
- [ ] Note the product ID

---

## Test 2: Product Detail Page

### Visual Elements
- [ ] Red "OUT OF STOCK" badge visible at top
- [ ] Badge has warning icon (⚠️)
- [ ] Badge text is uppercase
- [ ] Badge has subtle pulse animation
- [ ] Product images are greyed out (50% opacity)
- [ ] Images have grayscale filter
- [ ] Alert box shows below price
- [ ] Alert has red left border
- [ ] Alert shows X icon
- [ ] Alert text: "This product is currently unavailable"

### Button Behavior
- [ ] "Add to Cart" button shows "OUT OF STOCK"
- [ ] Button has X icon instead of bag icon
- [ ] Button is grey (not blue)
- [ ] Button has `disabled` attribute
- [ ] Cursor shows "not-allowed" on hover
- [ ] No hover animation on button
- [ ] Clicking button does nothing
- [ ] No success popup appears

### Other Functionality
- [ ] Product name displays correctly
- [ ] Price displays correctly
- [ ] Discount displays correctly
- [ ] Size options still visible
- [ ] Wishlist button still works
- [ ] Wishlist button is NOT disabled
- [ ] Can add to wishlist successfully
- [ ] Delivery options still visible
- [ ] Page layout not broken

### Responsive Design
- [ ] Test on desktop (> 1024px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on mobile (< 768px)
- [ ] Badge visible on all sizes
- [ ] Alert box readable on mobile
- [ ] Button full width on mobile

---

## Test 3: Men's Product Listing

### Navigate to Page
- [ ] Go to `http://localhost:8080/men-product.html`
- [ ] Page loads successfully
- [ ] Products display in grid

### Find Out-of-Stock Product
- [ ] Locate product with "OUT OF STOCK" badge
- [ ] Badge positioned top-right corner
- [ ] Badge has red gradient background
- [ ] Badge text is white and uppercase
- [ ] Badge has pulse animation

### Visual Verification
- [ ] Product image is greyed out
- [ ] Image has 50% opacity
- [ ] Image has grayscale filter
- [ ] Product card has reduced hover effect
- [ ] Cursor shows "not-allowed" on card
- [ ] Other products (in stock) look normal

### Interaction
- [ ] Can still click on out-of-stock card
- [ ] Card opens product detail page
- [ ] Quick view button still works
- [ ] Filtering still works (if applicable)
- [ ] Pagination still works

---

## Test 4: Women's Product Listing

### Navigate to Page
- [ ] Go to `http://localhost:8080/women-product.html`
- [ ] Page loads successfully
- [ ] Products display in grid

### Visual Verification
- [ ] Out-of-stock badge visible
- [ ] Badge positioned correctly
- [ ] Image greyed out
- [ ] Pulse animation active
- [ ] Reduced hover effect

### Interaction
- [ ] Card still clickable
- [ ] Opens detail page
- [ ] Quick view works
- [ ] Filtering works
- [ ] Pagination works

---

## Test 5: Stock Restoration

### Set Stock Back to Available
- [ ] Go to admin panel
- [ ] Edit the test product
- [ ] Set "Stock" to any number > 0 (e.g., 10)
- [ ] Save product

### Verify Normal Display
- [ ] Refresh product detail page
- [ ] Badge is GONE
- [ ] Alert box is GONE
- [ ] Images are full color
- [ ] "Add to Cart" button is blue
- [ ] Button shows "ADD TO BAG"
- [ ] Button is clickable
- [ ] Can add to cart successfully

### Verify on Listing Pages
- [ ] Refresh men's/women's page
- [ ] Badge is GONE from card
- [ ] Image is full color
- [ ] Normal hover effect
- [ ] Normal cursor

---

## Test 6: Edge Cases

### Product with No Stock Field
- [ ] Create product without setting stock
- [ ] View product detail page
- [ ] Should display as IN STOCK (default behavior)
- [ ] Can add to cart

### Product with Stock = null
- [ ] Set product stock to `null` in database
- [ ] View product detail page
- [ ] Should display as IN STOCK
- [ ] Can add to cart

### Product with Stock = undefined
- [ ] Remove stock field from product
- [ ] View product detail page
- [ ] Should display as IN STOCK
- [ ] Can add to cart

### Product with Stock = 1
- [ ] Set product stock to `1`
- [ ] View product detail page
- [ ] Should display as IN STOCK
- [ ] Can add to cart
- [ ] No out-of-stock indicators

---

## Test 7: Multiple Products

### Create Multiple Out-of-Stock Products
- [ ] Set 3-5 products to stock = 0
- [ ] View men's/women's listing page
- [ ] All out-of-stock products show badge
- [ ] All images greyed out
- [ ] In-stock products look normal
- [ ] Clear visual distinction

---

## Test 8: Browser Compatibility

### Chrome
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### Edge
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### Mobile Safari (iOS)
- [ ] Badge visible
- [ ] Images greyed
- [ ] Button disabled
- [ ] Responsive layout

### Chrome Mobile (Android)
- [ ] Badge visible
- [ ] Images greyed
- [ ] Button disabled
- [ ] Responsive layout

---

## Test 9: Performance

### Page Load Time
- [ ] Detail page loads in < 2 seconds
- [ ] Listing page loads in < 3 seconds
- [ ] No noticeable lag

### Animation Performance
- [ ] Badge pulse is smooth
- [ ] No frame drops
- [ ] GPU-accelerated

### Memory Usage
- [ ] No memory leaks
- [ ] Browser doesn't slow down
- [ ] Can navigate multiple pages

---

## Test 10: Accessibility

### Screen Reader
- [ ] Button has `disabled` attribute
- [ ] Screen reader announces "disabled"
- [ ] Badge text is readable

### Keyboard Navigation
- [ ] Tab key skips disabled button
- [ ] Can navigate to wishlist button
- [ ] Can navigate to other elements

### Color Contrast
- [ ] Red text readable on light background
- [ ] White text readable on red badge
- [ ] Meets WCAG AA standards

---

## Test 11: Error Handling

### API Failure
- [ ] Stop backend server
- [ ] Try to load product
- [ ] Error message displays
- [ ] Page doesn't crash

### Invalid Product ID
- [ ] Go to `product.html?id=invalid`
- [ ] Fallback product loads
- [ ] No JavaScript errors

### Network Issues
- [ ] Throttle network to 3G
- [ ] Page still loads
- [ ] Images load eventually
- [ ] Functionality intact

---

## Test 12: Integration

### Cart Integration
- [ ] Out-of-stock product cannot be added
- [ ] In-stock products can be added
- [ ] Cart count updates correctly
- [ ] Cart page works normally

### Wishlist Integration
- [ ] Can add out-of-stock to wishlist
- [ ] Wishlist count updates
- [ ] Wishlist page shows product
- [ ] Can remove from wishlist

### Search Integration
- [ ] Search for out-of-stock product
- [ ] Product appears in results
- [ ] Badge shows in search results
- [ ] Can click to view details

---

## Final Verification

### Documentation
- [ ] Read `OUT_OF_STOCK_FEATURE.md`
- [ ] Read `OUT_OF_STOCK_VISUAL_GUIDE.md`
- [ ] Read `QUICK_START_OUT_OF_STOCK.md`
- [ ] Understand implementation

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] Code is clean
- [ ] Comments are clear

### User Experience
- [ ] Feature is intuitive
- [ ] Visual feedback is clear
- [ ] No confusion
- [ ] Professional appearance

---

## Issue Tracking

### If Something Doesn't Work

1. **Check Console**
   - Open browser DevTools (F12)
   - Look for errors in Console tab
   - Note the error message

2. **Check Network**
   - Go to Network tab
   - Refresh page
   - Look for failed requests
   - Check API responses

3. **Check Database**
   - Verify product has `stock` field
   - Check stock value is exactly `0`
   - Verify product exists

4. **Check Servers**
   - Backend running on 5001?
   - Admin panel on 8000?
   - Frontend on 8080?

5. **Try Hard Refresh**
   - Mac: Cmd + Shift + R
   - Windows: Ctrl + Shift + R
   - Clears cache

6. **Check Documentation**
   - Review implementation docs
   - Check troubleshooting section
   - Follow quick start guide

---

## Success Criteria

### All Tests Pass ✅
- [ ] Product detail page shows out-of-stock UI
- [ ] Men's listing shows badges
- [ ] Women's listing shows badges
- [ ] Button is disabled
- [ ] Images are greyed
- [ ] Can restore to in-stock
- [ ] No console errors
- [ ] Works on all browsers
- [ ] Responsive on mobile
- [ ] Accessible

### Ready for Production ✅
- [ ] All tests completed
- [ ] No critical issues
- [ ] Documentation reviewed
- [ ] Team trained
- [ ] Backup created

---

**Testing Completed By:** _______________

**Date:** _______________

**Status:** ⬜ Pass  ⬜ Fail  ⬜ Needs Review

**Notes:**
_______________________________________
_______________________________________
_______________________________________
