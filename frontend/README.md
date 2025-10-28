# PYRAMID Frontend - Modular Architecture

## 🏗️ Project Structure

```
frontend/
├── index.html              # Main entry point
├── components/             # Reusable UI components
│   └── common/
│       ├── header.html     # Navigation header
│       ├── header.js       # Header functionality
│       ├── footer.html     # Site footer
│       └── footer.js       # Footer functionality
├── pages/                  # Individual page files
│   ├── index.html          # Home page
│   ├── product.html        # Product details
│   ├── cart.html           # Shopping cart
│   ├── checkout.html       # Checkout process
│   ├── login.html          # Authentication
│   ├── wishlist.html       # User wishlist
│   └── ...                 # Other pages
├── assets/                 # Static assets
│   ├── css/                # Stylesheets
│   │   ├── style.css       # Main styles
│   │   ├── components.css  # Component styles
│   │   └── ...             # Page-specific styles
│   ├── js/                 # JavaScript files
│   └── img/                # Images and media
└── utils/                  # Utility modules
    ├── app.js              # Main app initialization
    ├── component-loader.js # Component loading system
    └── base-component.js   # Base component class
```

## 🚀 Getting Started

### 1. Access the Application
- **Main Entry**: Open `frontend/index.html` in your browser
- **Direct Pages**: Navigate to `frontend/pages/[page-name].html`

### 2. Development
The application uses ES6 modules and a component-based architecture:

- **Components**: Reusable UI elements in `components/`
- **Pages**: Individual page implementations in `pages/`
- **Utils**: Core functionality and component system

## 🔧 Component System

### Component Loader
The `ComponentLoader` class handles dynamic loading of HTML components:

```javascript
// Load a component
await ComponentLoader.loadComponent('components/common/header.html', targetElement);

// Register a component class
ComponentLoader.registerComponent('header', HeaderComponent);
```

### Base Component
All components extend the `BaseComponent` class:

```javascript
import BaseComponent from '../utils/base-component.js';

class MyComponent extends BaseComponent {
    bindEvents() {
        this.on('click', this.handleClick, this.find('.my-button'));
    }
    
    handleClick(event) {
        // Handle click event
    }
}
```

## 📱 Features

### Header Component
- **Navigation**: Responsive menu with active states
- **User Actions**: Profile, cart, wishlist with live counts
- **Mobile Support**: Collapsible menu for mobile devices

### Footer Component
- **Newsletter**: Email subscription with validation
- **Social Links**: Social media integration with tracking
- **Quick Links**: Organized footer navigation

### App Initialization
The `app.js` file handles:
- Component loading and initialization
- Page-specific functionality
- Error handling and loading states
- Scroll animations and interactions

## 🎨 Styling

### CSS Architecture
- **Main Styles**: `assets/css/style.css` - Original page styles
- **Component Styles**: `assets/css/components.css` - Component-specific styles
- **Responsive Design**: Mobile-first approach with Bootstrap 5

### CSS Variables
```css
:root {
    --primary-color: #65AAC3;
    --secondary-color: #5F9FB6;
    --accent-color: #2c3e50;
    --gradient-primary: linear-gradient(135deg, #65AAC3 0%, #5F9FB6 100%);
}
```

## 🔄 Page Migration Status

✅ **Completed Pages:**
- `index.html` - Home page with hero section and product grid
- `product.html` - Product details with gallery and interactions
- All other pages have updated paths and basic component integration

🔄 **Component Integration:**
- Header and Footer components are loaded dynamically
- All image and CSS paths updated to new structure
- ES6 modules implemented for component system

## 🛠️ Maintenance

### Adding New Components
1. Create HTML template in `components/[category]/`
2. Create JavaScript class extending `BaseComponent`
3. Register component with `ComponentLoader`
4. Use in pages via component containers

### Adding New Pages
1. Create HTML file in `pages/`
2. Include component containers: `<div id="header-container"></div>`
3. Add component CSS: `<link rel="stylesheet" href="../assets/css/components.css">`
4. Include app script: `<script type="module" src="../utils/app.js"></script>`

### Updating Paths
All paths are relative to the page location:
- **From pages/**: `../assets/`, `../components/`, `../utils/`
- **From root**: `assets/`, `components/`, `utils/`

## 🚀 Benefits

1. **Maintainability**: Update header/footer in one place
2. **Reusability**: Components can be used across multiple pages
3. **Modularity**: Clear separation of concerns
4. **Scalability**: Easy to add new components and pages
5. **Modern Architecture**: ES6 modules and component-based design

## 📝 Notes

- Original pages in root directory can be safely removed after testing
- All functionality from original pages is preserved
- Component system is backward compatible
- Mobile responsive design maintained throughout