# Size Guide Troubleshooting Guide

## Issue: Size Guide Button Not Working

### ✅ FIXED: Bootstrap JavaScript Missing

**Problem**: The size guide modal wasn't opening when clicking the button.

**Root Cause**: Bootstrap JavaScript (bootstrap.bundle.min.js) was not loaded in product.html.

**Solution Applied**: Added Bootstrap JS bundle before closing `</body>` tag:
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

### How to Verify the Fix

1. **Clear Browser Cache**
   - Chrome: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
   - Or hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

2. **Reload the Product Page**
   - Navigate to: `http://127.0.0.1:5500/product.html?id=<product_id>`
   - Or your current product page URL

3. **Click "Size Guide" Button**
   - Should open a large modal with size information
   - Modal should have a blue gradient header

4. **Check Browser Console** (F12)
   - Should see no errors
   - Type: `typeof bootstrap` - should return "object"

### Test Page

A test page has been created to verify Bootstrap modal functionality:
- **File**: `test-modal.html`
- **URL**: `http://127.0.0.1:5500/test-modal.html`
- Click "Open Test Modal" to verify Bootstrap is working

## Common Issues & Solutions

### Issue 1: Modal Still Not Opening

**Possible Causes**:
1. Browser cache not cleared
2. JavaScript errors blocking execution
3. Bootstrap JS not loaded

**Solutions**:
```bash
# 1. Hard refresh browser
Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

# 2. Check browser console (F12)
# Look for any red error messages

# 3. Verify Bootstrap is loaded
# In console, type:
typeof bootstrap
# Should return: "object"
```

### Issue 2: Modal Opens But Looks Wrong

**Possible Causes**:
1. Bootstrap CSS not loaded
2. Custom CSS conflicts
3. Cache issues

**Solutions**:
```html
<!-- Verify this line exists in <head> -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
```

### Issue 3: Button Visible But Not Clickable

**Possible Causes**:
1. CSS z-index issues
2. Overlapping elements
3. Button disabled

**Solutions**:
```css
/* Check button has correct attributes */
<button class="size-guide-link" 
        data-bs-toggle="modal" 
        data-bs-target="#sizeGuideModal">
```

### Issue 4: Console Errors

**Common Errors & Fixes**:

**Error**: `bootstrap is not defined`
```html
<!-- Add Bootstrap JS before closing </body> -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
```

**Error**: `Cannot read property 'Modal' of undefined`
```javascript
// Bootstrap JS not loaded or loaded after your script
// Move Bootstrap JS before your custom scripts
```

**Error**: `$ is not defined`
```javascript
// jQuery not needed for Bootstrap 5
// Remove any jQuery dependencies
```

## Verification Checklist

- [ ] Bootstrap CSS loaded in `<head>`
- [ ] Bootstrap JS loaded before `</body>`
- [ ] Button has `data-bs-toggle="modal"` attribute
- [ ] Button has `data-bs-target="#sizeGuideModal"` attribute
- [ ] Modal has `id="sizeGuideModal"` attribute
- [ ] Modal has class `modal fade`
- [ ] Browser cache cleared
- [ ] No JavaScript errors in console

## Testing Steps

### Step 1: Check Files
```bash
# Verify Bootstrap JS is in product.html
grep "bootstrap.bundle" product.html
# Should show: bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js
```

### Step 2: Test Modal
1. Open product page
2. Open browser console (F12)
3. Type: `new bootstrap.Modal(document.getElementById('sizeGuideModal')).show()`
4. Modal should open

### Step 3: Test Button
1. Right-click "Size Guide" button
2. Inspect element
3. Verify attributes:
   - `data-bs-toggle="modal"`
   - `data-bs-target="#sizeGuideModal"`

## Browser-Specific Issues

### Chrome
- Clear cache: Settings > Privacy > Clear browsing data
- Disable extensions that might interfere
- Try incognito mode

### Firefox
- Clear cache: Options > Privacy > Clear Data
- Disable add-ons
- Try private window

### Safari
- Clear cache: Develop > Empty Caches
- Enable Develop menu: Preferences > Advanced
- Try private window

## Network Issues

### CDN Not Loading
If Bootstrap CDN is blocked:

**Option 1**: Download Bootstrap locally
```bash
# Download Bootstrap
curl -o bootstrap.bundle.min.js https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js

# Update HTML
<script src="js/bootstrap.bundle.min.js"></script>
```

**Option 2**: Use different CDN
```html
<!-- Alternative CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
```

## Debug Mode

Add this script to check Bootstrap status:
```html
<script>
  console.log('Bootstrap loaded:', typeof bootstrap !== 'undefined');
  console.log('Modal element exists:', document.getElementById('sizeGuideModal') !== null);
  console.log('Button exists:', document.querySelector('[data-bs-target="#sizeGuideModal"]') !== null);
</script>
```

## Quick Fix Script

If modal still doesn't work, add this manual trigger:
```html
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const sizeGuideBtn = document.querySelector('[data-bs-target="#sizeGuideModal"]');
    const modal = document.getElementById('sizeGuideModal');
    
    if (sizeGuideBtn && modal) {
      sizeGuideBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
      });
    }
  });
</script>
```

## Contact Support

If issues persist:
1. Check browser console for errors
2. Verify all files are loaded (Network tab)
3. Test with test-modal.html
4. Check Bootstrap version compatibility

## Success Indicators

✅ Modal opens smoothly  
✅ Modal has blue gradient header  
✅ All sections visible  
✅ Close button works  
✅ Clicking outside closes modal  
✅ ESC key closes modal  
✅ No console errors  

## Additional Resources

- [Bootstrap 5 Modal Documentation](https://getbootstrap.com/docs/5.3/components/modal/)
- [Bootstrap 5 Migration Guide](https://getbootstrap.com/docs/5.3/migration/)
- Test page: `test-modal.html`

---

**Status**: Issue Fixed ✅  
**Fix Applied**: Bootstrap JS added to product.html  
**Action Required**: Clear browser cache and reload page
