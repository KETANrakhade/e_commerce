# Size Guide Feature - Structure Diagram

## 📊 Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Product Page (product.html)              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Product Information Section               │    │
│  │                                                      │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Size Selection Area                      │     │    │
│  │  │                                           │     │    │
│  │  │  SELECT SIZE    [📏 Size Guide] ←─────┐  │     │    │
│  │  │                                        │  │     │    │
│  │  │  [39] [40] [42] [44]                  │  │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│                                    Triggers Modal ↓          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Size Guide Modal (Bootstrap 5)             │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Header (Gradient Blue)                   │     │    │
│  │  │  📏 Size Guide & Measurement Instructions │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Body (Scrollable)                        │     │    │
│  │  │                                           │     │    │
│  │  │  ┌─────────────────────────────────┐    │     │    │
│  │  │  │  How to Measure (6 Cards)       │    │     │    │
│  │  │  │  [Chest] [Waist] [Hips]         │    │     │    │
│  │  │  │  [Shoulder] [Sleeve] [Length]   │    │     │    │
│  │  │  └─────────────────────────────────┘    │     │    │
│  │  │                                           │     │    │
│  │  │  ┌─────────────────────────────────┐    │     │    │
│  │  │  │  Measurement Tips (Yellow Box)  │    │     │    │
│  │  │  │  • Use soft tape                │    │     │    │
│  │  │  │  • Wear fitted clothing         │    │     │    │
│  │  │  │  • Keep tape parallel           │    │     │    │
│  │  │  └─────────────────────────────────┘    │     │    │
│  │  │                                           │     │    │
│  │  │  ┌─────────────────────────────────┐    │     │    │
│  │  │  │  Men's Size Chart (Table)       │    │     │    │
│  │  │  │  XS | S | M | L | XL | XXL      │    │     │    │
│  │  │  └─────────────────────────────────┘    │     │    │
│  │  │                                           │     │    │
│  │  │  ┌─────────────────────────────────┐    │     │    │
│  │  │  │  Women's Size Chart (Table)     │    │     │    │
│  │  │  │  XS | S | M | L | XL | XXL      │    │     │    │
│  │  │  └─────────────────────────────────┘    │     │    │
│  │  │                                           │     │    │
│  │  │  ┌─────────────────────────────────┐    │     │    │
│  │  │  │  Fit Guide (3 Cards)            │    │     │    │
│  │  │  │  [Slim] [Regular] [Relaxed]     │    │     │    │
│  │  │  └─────────────────────────────────┘    │     │    │
│  │  │                                           │     │    │
│  │  │  ┌─────────────────────────────────┐    │     │    │
│  │  │  │  International Conversion       │    │     │    │
│  │  │  │  US | UK | EU | Japan           │    │     │    │
│  │  │  └─────────────────────────────────┘    │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │  Footer                                   │     │    │
│  │  │  [Close Button]                           │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ File Structure

```
e-commerce/
│
├── 📄 product.html (MODIFIED)
│   ├── Size guide button added
│   ├── Complete modal HTML
│   └── Inline CSS styles
│
├── 📄 size-guide-demo.html (NEW)
│   └── Standalone demo page
│
├── 📁 css/
│   └── 📄 size-guide.css (NEW)
│       ├── Modal styles
│       ├── Card styles
│       ├── Table styles
│       └── Responsive styles
│
├── 📁 js/
│   └── 📄 size-guide-modal.js (NEW)
│       ├── Modal HTML generator
│       ├── Auto-injection logic
│       └── Event handlers
│
└── 📁 docs/
    ├── 📄 SIZE_GUIDE_FEATURE.md
    ├── 📄 SIZE_GUIDE_USAGE.md
    ├── 📄 SIZE_GUIDE_IMPLEMENTATION_SUMMARY.md
    ├── 📄 SIZE_GUIDE_QUICK_REFERENCE.md
    └── 📄 SIZE_GUIDE_STRUCTURE.md (this file)
```

## 🔄 User Flow Diagram

```
┌─────────────┐
│   Customer  │
│   Visits    │
│   Product   │
│    Page     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Sees      │
│  "Size      │
│   Guide"    │
│   Button    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Clicks    │
│   Button    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Modal     │
│   Opens     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Reads     │
│ Measurement │
│Instructions │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Measures   │
│   Self      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Compares   │
│    with     │
│ Size Chart  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Identifies │
│    Size     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Closes    │
│   Modal     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Selects   │
│    Size     │
│  on Page    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Adds to   │
│    Cart     │
└─────────────┘
```

## 🎨 Component Hierarchy

```
Size Guide Modal
│
├── Header Section
│   ├── Title with Icon
│   └── Close Button
│
├── Body Section (Scrollable)
│   │
│   ├── Measurement Instructions
│   │   ├── Title
│   │   ├── Introduction Text
│   │   └── Measurement Cards (6)
│   │       ├── Chest Card
│   │       ├── Waist Card
│   │       ├── Hips Card
│   │       ├── Shoulder Card
│   │       ├── Sleeve Card
│   │       └── Length Card
│   │
│   ├── Measurement Tips
│   │   ├── Title with Icon
│   │   └── Bullet List (5 tips)
│   │
│   ├── Size Charts Section
│   │   │
│   │   ├── Men's Size Chart
│   │   │   ├── Title with Icon
│   │   │   └── Table
│   │   │       ├── Header Row
│   │   │       └── Data Rows (6 sizes)
│   │   │
│   │   └── Women's Size Chart
│   │       ├── Title with Icon
│   │       └── Table
│   │           ├── Header Row
│   │           └── Data Rows (6 sizes)
│   │
│   ├── Fit Guide
│   │   ├── Title with Icon
│   │   └── Fit Cards (3)
│   │       ├── Slim Fit Card
│   │       ├── Regular Fit Card
│   │       └── Relaxed Fit Card
│   │
│   └── International Conversion
│       ├── Title with Icon
│       └── Conversion Table
│           ├── Header Row
│           └── Data Rows (6 sizes)
│
└── Footer Section
    └── Close Button
```

## 🎯 Data Flow

```
┌──────────────────┐
│  Size Chart Data │
│  (Hardcoded in   │
│   HTML/JS)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Modal Component │
│  (Bootstrap 5)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  CSS Styling     │
│  (size-guide.css)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Rendered Modal  │
│  (User sees)     │
└──────────────────┘
```

## 🔧 Integration Points

```
Product Page
    │
    ├─→ Bootstrap 5 (Required)
    │   ├── Modal Component
    │   ├── Grid System
    │   └── Utilities
    │
    ├─→ Bootstrap Icons (Required)
    │   └── Icon Set
    │
    ├─→ size-guide.css (Optional)
    │   └── Custom Styles
    │
    └─→ size-guide-modal.js (Optional)
        └── Auto-inject Modal
```

## 📱 Responsive Breakpoints

```
┌─────────────────────────────────────────┐
│  Desktop (> 992px)                      │
│  ┌───────────────────────────────────┐ │
│  │  Modal: Large (800px)             │ │
│  │  Layout: Multi-column             │ │
│  │  Tables: Full width               │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Tablet (768px - 992px)                 │
│  ┌───────────────────────────────────┐ │
│  │  Modal: Medium (700px)            │ │
│  │  Layout: Adjusted columns         │ │
│  │  Tables: Responsive scroll        │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Mobile (< 768px)                       │
│  ┌───────────────────────────────────┐ │
│  │  Modal: Full screen               │ │
│  │  Layout: Single column            │ │
│  │  Tables: Horizontal scroll        │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🎨 Style Cascade

```
Bootstrap 5 Base Styles
         │
         ▼
size-guide.css Custom Styles
         │
         ▼
Inline Styles (if any)
         │
         ▼
Final Rendered Styles
```

## 🔄 Event Flow

```
User Action          →  Event Trigger       →  Result
─────────────────────────────────────────────────────────
Click "Size Guide"   →  data-bs-toggle     →  Modal Opens
Click Close Button   →  data-bs-dismiss    →  Modal Closes
Click Overlay        →  Bootstrap Handler  →  Modal Closes
Press Escape Key     →  Bootstrap Handler  →  Modal Closes
Hover Card           →  CSS :hover         →  Card Highlights
Hover Table Row      →  CSS :hover         →  Row Highlights
```

## 📊 Performance Flow

```
Page Load
    │
    ├─→ HTML Parsed
    │   └─→ Modal HTML in DOM (hidden)
    │
    ├─→ CSS Loaded
    │   └─→ Styles Applied
    │
    ├─→ JS Loaded (if using modal.js)
    │   └─→ Modal Injected
    │
    └─→ Page Ready
        │
        └─→ User Clicks Button
            │
            └─→ Modal Shows (instant)
                │
                └─→ No additional loading
```

## 🎯 Component States

```
Size Guide Button
    │
    ├─→ Default State (Blue text)
    ├─→ Hover State (Light blue background)
    └─→ Active State (Modal opens)

Modal
    │
    ├─→ Hidden State (display: none)
    ├─→ Opening State (fade in animation)
    ├─→ Open State (fully visible)
    ├─→ Closing State (fade out animation)
    └─→ Hidden State (display: none)

Measurement Cards
    │
    ├─→ Default State (Gray background)
    └─→ Hover State (White background, blue border)

Table Rows
    │
    ├─→ Default State (White background)
    └─→ Hover State (Light blue background)
```

## 🔗 Dependencies Graph

```
                    Bootstrap 5
                         │
                         ├─→ Modal Component
                         ├─→ Grid System
                         ├─→ Table Component
                         └─→ Utilities
                              │
                              ▼
                    Bootstrap Icons
                         │
                         └─→ Icon Set
                              │
                              ▼
                    size-guide.css
                         │
                         └─→ Custom Styles
                              │
                              ▼
                    size-guide-modal.js
                         │
                         └─→ Modal HTML
                              │
                              ▼
                    Final Rendered Page
```

## 📈 Implementation Timeline

```
Phase 1: Design & Planning
    │
    ├─→ Requirements gathering
    ├─→ Design mockups
    └─→ Technical planning
         │
         ▼
Phase 2: Development
    │
    ├─→ HTML structure
    ├─→ CSS styling
    ├─→ JavaScript component
    └─→ Integration
         │
         ▼
Phase 3: Testing
    │
    ├─→ Functionality testing
    ├─→ Responsive testing
    ├─→ Browser testing
    └─→ Accessibility testing
         │
         ▼
Phase 4: Documentation
    │
    ├─→ Technical docs
    ├─→ User guides
    └─→ Quick references
         │
         ▼
Phase 5: Deployment
    │
    └─→ Production ready ✅
```

---

**Visual Structure**: Complete  
**Component Hierarchy**: Documented  
**Data Flow**: Mapped  
**Integration Points**: Identified  
**Status**: Production Ready ✅
