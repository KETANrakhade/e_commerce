// Integration script for connecting color selection with existing backend

/**
 * Backend Integration for Product Color Selection
 * This file shows how to integrate the color selection feature with your existing backend
 */

// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Fetch product data from backend with color variants
 */
async function fetchProductWithColors(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
            return transformBackendProduct(data.data);
        } else {
            throw new Error(data.message || 'Failed to fetch product');
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
}

/**
 * Transform backend product data to match color selection format
 */
function transformBackendProduct(backendProduct) {
    // If product already has color variants, use them
    if (backendProduct.colors && Object.keys(backendProduct.colors).length > 0) {
        return backendProduct;
    }
    
    // Otherwise, create color variants from existing product data
    const colorVariants = createColorVariantsFromProduct(backendProduct);
    
    return {
        id: backendProduct._id || backendProduct.id,
        title: backendProduct.name || backendProduct.title,
        brand: backendProduct.brand || 'Pyramid Fashion',
        basePrice: backendProduct.price || backendProduct.basePrice,
        originalPrice: backendProduct.originalPrice || backendProduct.price * 1.3,
        discount: Math.round(((backendProduct.originalPrice - backendProduct.price) / backendProduct.originalPrice) * 100) || 0,
        rating: backendProduct.rating || 4.0,
        ratingCount: backendProduct.ratingCount || 100,
        material: backendProduct.material || 'Cotton Blend',
        description: backendProduct.description,
        defaultColor: 'default',
        availableSizes: backendProduct.sizes || ['S', 'M', 'L', 'XL'],
        colors: colorVariants
    };
}

/**
 * Create color variants from single product
 */
function createColorVariantsFromProduct(product) {
    const images = product.images || [];
    
    // If product has multiple images, create variants
    if (images.length > 1) {
        return {
            default: {
                name: 'Default',
                sku: product.sku || `${product._id}-DEF`,
                availability: product.stock > 0 ? 'in-stock' : 'out-of-stock',
                stockCount: product.stock || 0,
                images: images,
                thumbnail: images[0],
                priceModifier: 0
            }
        };
    }
    
    // Create multiple color variants with same image
    return {
        black: {
            name: 'Black',
            sku: `${product.sku || product._id}-BLK`,
            availability: product.stock > 0 ? 'in-stock' : 'out-of-stock',
            stockCount: Math.floor(product.stock * 0.4) || 0,
            images: images.length > 0 ? images : ['/img/placeholder.jpg'],
            thumbnail: images[0] || '/img/placeholder.jpg',
            priceModifier: 0
        },
        white: {
            name: 'White',
            sku: `${product.sku || product._id}-WHT`,
            availability: product.stock > 0 ? 'in-stock' : 'out-of-stock',
            stockCount: Math.floor(product.stock * 0.3) || 0,
            images: images.length > 0 ? images : ['/img/placeholder.jpg'],
            thumbnail: images[0] || '/img/placeholder.jpg',
            priceModifier: 0
        },
        navy: {
            name: 'Navy Blue',
            sku: `${product.sku || product._id}-NVY`,
            availability: product.stock > 0 ? 'in-stock' : 'out-of-stock',
            stockCount: Math.floor(product.stock * 0.3) || 0,
            images: images.length > 0 ? images : ['/img/placeholder.jpg'],
            thumbnail: images[0] || '/img/placeholder.jpg',
            priceModifier: 0
        }
    };
}

/**
 * Update existing product pages with color selection
 */
function integrateColorSelectionIntoProductPage() {
    // Check if we're on a product page
    const productContainer = document.querySelector('.product-details, .product-page, #product-container');
    if (!productContainer) {
        console.log('Not on a product page, skipping color selection integration');
        return;
    }
    
    // Get product ID from URL or data attribute
    const productId = getProductIdFromPage();
    if (!productId) {
        console.error('Could not determine product ID');
        return;
    }
    
    // Load and integrate color selection
    loadColorSelectionForProduct(productId);
}

/**
 * Get product ID from current page
 */
function getProductIdFromPage() {
    // Try to get from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let productId = urlParams.get('id') || urlParams.get('productId');
    
    if (productId) return productId;
    
    // Try to get from data attributes
    const productElement = document.querySelector('[data-product-id]');
    if (productElement) {
        return productElement.getAttribute('data-product-id');
    }
    
    // Try to get from URL path
    const pathMatch = window.location.pathname.match(/\/product\/([^\/]+)/);
    if (pathMatch) {
        return pathMatch[1];
    }
    
    return null;
}

/**
 * Load color selection for specific product
 */
async function loadColorSelectionForProduct(productId) {
    try {
        // Show loading state
        showLoadingState();
        
        // Fetch product data
        const productData = await fetchProductWithColors(productId);
        
        // Create color selection UI
        createColorSelectionUI(productData);
        
        // Hide loading state
        hideLoadingState();
        
    } catch (error) {
        console.error('Failed to load color selection:', error);
        hideLoadingState();
        showErrorState(error.message);
    }
}

/**
 * Create color selection UI elements
 */
function createColorSelectionUI(productData) {
    // Find insertion point
    const insertionPoint = findInsertionPoint();
    if (!insertionPoint) {
        console.error('Could not find suitable insertion point for color selection');
        return;
    }
    
    // Create color selection HTML
    const colorSelectionHTML = `
        <div class="color-selection-section" id="productColorSelection">
            <h3 class="section-title">
                Select Color: <span id="selectedColorName">${productData.colors[productData.defaultColor]?.name || 'Default'}</span>
            </h3>
            <div id="colorThumbnails" class="color-thumbnails">
                ${generateColorThumbnailsHTML(productData.colors)}
            </div>
        </div>
    `;
    
    // Insert HTML
    insertionPoint.insertAdjacentHTML('afterend', colorSelectionHTML);
    
    // Initialize functionality
    initializeColorSelection(productData);
    
    // Update existing product images
    updateExistingProductImages(productData);
}

/**
 * Find best insertion point for color selection
 */
function findInsertionPoint() {
    // Try common selectors for product image or price sections
    const selectors = [
        '.product-image, .product-gallery',
        '.product-price, .price-section',
        '.product-title, .product-name',
        '.product-info:first-child',
        '.product-details > *:first-child'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
            return element;
        }
    }
    
    return null;
}

/**
 * Generate HTML for color thumbnails
 */
function generateColorThumbnailsHTML(colors) {
    return Object.entries(colors).map(([colorKey, colorData]) => `
        <div class="color-thumbnail" data-color="${colorKey}" onclick="selectProductColor('${colorKey}')">
            <img src="${colorData.thumbnail}" alt="${colorData.name}" onerror="this.style.display='none'">
            <div class="color-name">${colorData.name}</div>
            ${colorData.availability === 'out-of-stock' ? '<div class="availability-indicator out-of-stock">Out of Stock</div>' : ''}
        </div>
    `).join('');
}

/**
 * Initialize color selection functionality
 */
function initializeColorSelection(productData) {
    // Store product data globally
    window.currentProductData = productData;
    window.currentSelectedColor = productData.defaultColor;
    
    // Add event listeners
    document.querySelectorAll('.color-thumbnail').forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const colorKey = this.getAttribute('data-color');
            selectProductColor(colorKey);
        });
    });
    
    // Set initial active state
    const defaultThumbnail = document.querySelector(`[data-color="${productData.defaultColor}"]`);
    if (defaultThumbnail) {
        defaultThumbnail.classList.add('active');
    }
}

/**
 * Handle color selection
 */
function selectProductColor(colorKey) {
    const productData = window.currentProductData;
    if (!productData || !productData.colors[colorKey]) {
        console.error('Invalid color selection:', colorKey);
        return;
    }
    
    const colorData = productData.colors[colorKey];
    
    // Update active thumbnail
    document.querySelectorAll('.color-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    document.querySelector(`[data-color="${colorKey}"]`).classList.add('active');
    
    // Update selected color name
    const colorNameElement = document.getElementById('selectedColorName');
    if (colorNameElement) {
        colorNameElement.textContent = colorData.name;
    }
    
    // Update product images
    updateProductImages(colorData.images);
    
    // Update product details
    updateProductDetails(colorData);
    
    // Update global state
    window.currentSelectedColor = colorKey;
    
    // Trigger custom event
    const event = new CustomEvent('colorChanged', {
        detail: { colorKey, colorData, productData }
    });
    document.dispatchEvent(event);
    
    // Update URL without reload
    updateURLWithColor(colorKey);
}

/**
 * Update existing product images
 */
function updateExistingProductImages(productData) {
    const defaultColor = productData.colors[productData.defaultColor];
    if (defaultColor && defaultColor.images.length > 0) {
        updateProductImages(defaultColor.images);
    }
}

/**
 * Update product images in existing gallery
 */
function updateProductImages(images) {
    // Update main product image
    const mainImage = document.querySelector('.product-image img, .main-image, .product-gallery img:first-child');
    if (mainImage && images.length > 0) {
        mainImage.src = images[0];
        mainImage.alt = 'Product Image';
    }
    
    // Update image gallery if exists
    const imageGallery = document.querySelector('.image-gallery, .product-images');
    if (imageGallery) {
        imageGallery.innerHTML = images.map((image, index) => `
            <img src="${image}" alt="Product Image ${index + 1}" class="gallery-image" onclick="selectMainImage('${image}')">
        `).join('');
    }
}

/**
 * Update product details based on color
 */
function updateProductDetails(colorData) {
    // Update SKU
    const skuElement = document.querySelector('.product-sku, .sku, [data-field="sku"]');
    if (skuElement) {
        skuElement.textContent = colorData.sku;
    }
    
    // Update availability
    const availabilityElement = document.querySelector('.product-availability, .availability, [data-field="availability"]');
    if (availabilityElement) {
        availabilityElement.textContent = getAvailabilityText(colorData.availability);
        availabilityElement.className = `availability ${colorData.availability}`;
    }
    
    // Update stock count
    const stockElement = document.querySelector('.stock-count, [data-field="stock"]');
    if (stockElement && colorData.stockCount) {
        stockElement.textContent = `${colorData.stockCount} in stock`;
    }
}

/**
 * Utility functions
 */
function getAvailabilityText(availability) {
    switch (availability) {
        case 'in-stock': return 'In Stock';
        case 'low-stock': return 'Only Few Left';
        case 'out-of-stock': return 'Out of Stock';
        default: return 'Check Availability';
    }
}

function selectMainImage(imageSrc) {
    const mainImage = document.querySelector('.product-image img, .main-image');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
}

function updateURLWithColor(colorKey) {
    const url = new URL(window.location);
    url.searchParams.set('color', colorKey);
    window.history.replaceState({}, '', url);
}

function showLoadingState() {
    const loadingHTML = '<div id="colorSelectionLoading" class="loading-state">Loading color options...</div>';
    const insertionPoint = findInsertionPoint();
    if (insertionPoint) {
        insertionPoint.insertAdjacentHTML('afterend', loadingHTML);
    }
}

function hideLoadingState() {
    const loadingElement = document.getElementById('colorSelectionLoading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function showErrorState(message) {
    const errorHTML = `<div id="colorSelectionError" class="error-state">Failed to load color options: ${message}</div>`;
    const insertionPoint = findInsertionPoint();
    if (insertionPoint) {
        insertionPoint.insertAdjacentHTML('afterend', errorHTML);
    }
}

/**
 * Auto-initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    // Add required CSS if not already present
    if (!document.querySelector('#colorSelectionCSS')) {
        const cssLink = document.createElement('link');
        cssLink.id = 'colorSelectionCSS';
        cssLink.rel = 'stylesheet';
        cssLink.href = 'css/product-color-selection.css';
        document.head.appendChild(cssLink);
    }
    
    // Initialize color selection
    integrateColorSelectionIntoProductPage();
});

/**
 * Export functions for external use
 */
window.ProductColorIntegration = {
    fetchProductWithColors,
    loadColorSelectionForProduct,
    selectProductColor,
    updateProductImages,
    updateProductDetails
};

/**
 * Backend Model Extension
 * Add this to your existing product model to support color variants
 */
const colorVariantSchema = `
// Add to your existing Product model
colors: {
    type: Map,
    of: {
        name: { type: String, required: true },
        hexCode: String,
        sku: { type: String, required: true, unique: true },
        availability: { 
            type: String, 
            enum: ['in-stock', 'low-stock', 'out-of-stock'], 
            default: 'in-stock' 
        },
        stockCount: { type: Number, default: 0 },
        images: [String],
        thumbnail: String,
        priceModifier: { type: Number, default: 0 }
    }
},
defaultColor: { type: String, default: 'black' }
`;

/**
 * Backend API Routes
 * Add these routes to your existing product routes
 */
const apiRoutes = `
// GET /api/products/:id/colors - Get color variants for a product
router.get('/:id/colors', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select('colors defaultColor');
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.json({
            success: true,
            data: {
                colors: product.colors,
                defaultColor: product.defaultColor
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/products/:id/colors/:colorKey - Update specific color variant
router.put('/:id/colors/:colorKey', async (req, res) => {
    try {
        const { id, colorKey } = req.params;
        const updateData = req.body;
        
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        if (!product.colors.has(colorKey)) {
            return res.status(404).json({ success: false, message: 'Color variant not found' });
        }
        
        // Update color variant
        const colorData = product.colors.get(colorKey);
        Object.assign(colorData, updateData);
        product.colors.set(colorKey, colorData);
        
        await product.save();
        
        res.json({
            success: true,
            data: product.colors.get(colorKey)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
`;

console.log('Product Color Selection Integration loaded successfully!');
console.log('Use ProductColorIntegration.loadColorSelectionForProduct(productId) to manually initialize');