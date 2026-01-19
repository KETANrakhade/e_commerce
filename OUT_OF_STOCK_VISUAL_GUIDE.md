# Out of Stock Feature - Visual Guide

## What Users Will See

### When Product is IN STOCK (Normal View)
```
┌─────────────────────────────────────────────────────┐
│  [Product Images - Full Color]                      │
│                                                      │
│  Product Name                                        │
│  ₹999  ₹1199  (20% OFF)                             │
│  inclusive of all taxes                              │
│                                                      │
│  SELECT SIZE                                         │
│  [39] [40] [42] [44]                                │
│                                                      │
│  [🛍️ ADD TO BAG]  [❤️ WISHLIST]                    │
│                                                      │
│  Delivery Options                                    │
│  [Enter Pincode]                                     │
└─────────────────────────────────────────────────────┘
```

### When Product is OUT OF STOCK
```
┌─────────────────────────────────────────────────────┐
│  [Product Images - Greyed Out & Faded]              │
│                                                      │
│  ⚠️ OUT OF STOCK  ← Red pulsing badge              │
│                                                      │
│  Product Name                                        │
│  ₹999  ₹1199  (20% OFF)                             │
│  inclusive of all taxes                              │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ ❌ This product is currently unavailable    │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  SELECT SIZE                                         │
│  [39] [40] [42] [44]                                │
│                                                      │
│  [❌ OUT OF STOCK] (Disabled)  [❤️ WISHLIST]       │
│                                                      │
│  Delivery Options                                    │
│  [Enter Pincode]                                     │
└─────────────────────────────────────────────────────┘
```

## Key Visual Changes

### 1. Out of Stock Badge
- **Position**: Top of product details, above product name
- **Color**: Red gradient (#e74c3c → #c0392b)
- **Icon**: Warning triangle (⚠️)
- **Animation**: Subtle pulse effect
- **Text**: "OUT OF STOCK" in uppercase

### 2. Product Images
- **Opacity**: Reduced to 50%
- **Filter**: 60% grayscale
- **Effect**: Washed out, faded appearance
- **Applies to**: Both main slider and thumbnail images

### 3. Stock Alert Box
- **Position**: Below price, above size selection
- **Background**: Light red (rgba(231, 76, 60, 0.1))
- **Border**: 4px solid red on left side
- **Icon**: Red X circle (❌)
- **Text**: "This product is currently unavailable"

### 4. Add to Cart Button
- **State**: Disabled
- **Color**: Grey (#95a5a6)
- **Opacity**: 60%
- **Icon**: X circle instead of bag
- **Text**: "OUT OF STOCK" instead of "ADD TO BAG"
- **Cursor**: not-allowed
- **Hover**: No animation or effects

## Color Palette

```css
/* Out of Stock Colors */
Badge Background:     #e74c3c → #c0392b (gradient)
Badge Text:           #ffffff (white)
Alert Background:     rgba(231, 76, 60, 0.1)
Alert Border:         #e74c3c
Alert Text:           #e74c3c
Disabled Button:      #95a5a6
Image Overlay:        50% opacity + 60% grayscale
```

## Responsive Behavior

### Desktop (> 768px)
- Badge appears above product name
- Alert box full width
- Button maintains original size
- Images in 2-column grid

### Mobile (< 768px)
- Badge stacks above name
- Alert box full width with padding
- Button full width
- Images stack vertically

## Animation Details

### Badge Pulse
```css
@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}
Duration: 2s
Iteration: infinite
```

### Image Fade
```css
Transition: all 0.3s ease
Opacity: 0.5
Filter: grayscale(60%)
```

## User Experience Flow

1. **User lands on product page**
   - Page loads normally
   - Product data fetched from API

2. **Stock check performed**
   - JavaScript checks `product.stock === 0`
   - If true, triggers out-of-stock UI

3. **Visual changes applied**
   - Badge appears with animation
   - Images fade and grey out
   - Alert box slides in
   - Button becomes disabled

4. **User attempts to add to cart**
   - Click on disabled button does nothing
   - Error toast appears: "This product is out of stock"
   - User cannot proceed to checkout

5. **User can still**
   - View product details
   - Add to wishlist (to track when back in stock)
   - Navigate to other products
   - Check delivery options

## Accessibility

- **Screen Readers**: Button has `disabled` attribute
- **Keyboard Navigation**: Button is not focusable when disabled
- **Color Contrast**: Red text on light background meets WCAG AA
- **Icons**: Bootstrap icons with semantic meaning
- **Alt Text**: Images maintain alt text even when greyed

## Testing Checklist

- [ ] Badge appears when stock = 0
- [ ] Badge hidden when stock > 0
- [ ] Images are greyed out
- [ ] Alert box shows correct message
- [ ] Button is disabled and grey
- [ ] Button text changes to "OUT OF STOCK"
- [ ] Clicking button shows error
- [ ] Cannot add to cart
- [ ] Wishlist still works
- [ ] Responsive on mobile
- [ ] Works with API products
- [ ] Works with hardcoded products

## Browser Testing

Tested on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)
