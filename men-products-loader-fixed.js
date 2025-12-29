// Fixed Men's Products Dynamic Loader
console.log('🔵 Fixed Men\'s products loader initialized');

// Load men's products from API
async function loadMensProducts() {
    try {
        console.log('📦 Fetching men\'s products...');
        
        // Show loading state
        const productGrid = document.getElementById('productGrid');
        if (productGrid) {
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #65AAC3; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                    <p style="color: #999;">Loading men's products...</p>
                </div>
            `;
        }
        
        // Try multiple category variations for men's products
        let data = null;
        const categoryVariations = ['men', 'male', 'mens'];
        
        for (const category of categoryVariations) {
            try {
                console.log(`🔍 Trying category: ${category}`);
                const response = await fetch(`${window.API_BASE_URL}/products/category/${category}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log(`📡 Response status for ${category}:`, response.status);
                
                if (response.ok) {
                    const responseData = await response.json();
                    console.log(`📊 Response data for ${category}:`, responseData);
                    
                    if (responseData.success && responseData.data?.products?.length > 0) {
                        console.log(`✅ Found ${responseData.data.products.length} products using category: ${category}`);
                        data = responseData;
                        break;
                    }
                }
            } catch (error) {
                console.log(`❌ Failed to fetch with category: ${category}`, error);
            }
        }
        
        if (!data) {
            console.error('❌ Failed to fetch products with any category variation');
            showNoProducts('No men\'s products found. Try adding products via admin panel.');
            return;
        }
        
        const products = data.data?.products || [];
        console.log(`✅ Loaded ${products.length} men's products:`, products);
        
        displayMensProducts(products);
        
    } catch (error) {
        console.error('❌ Error loading men\'s products:', error);
        showNoProducts('Error loading products. Please check your connection.');
    }
}

// Display products in the grid
function displayMensProducts(products) {
    console.log('🎯 displayMensProducts called with:', products.length, 'products');
    
    const productGrid = document.getElementById('productGrid');
    
    if (!productGrid) {
        console.error('❌ Product grid not found');
        return;
    }
    
    console.log('✅ Product grid found, clearing content...');
    
    if (products.length === 0) {
        showNoProducts('No men\'s products available.');
        return;
    }
    
    console.log('🔄 Creating product cards...');
    
    let allProductsHTML = '';
    
    // Create product cards
    products.forEach((product, index) => {
        console.log(`Creating card ${index + 1}: ${product.name}`);
        console.log(`Product images:`, product.images);
        console.log(`Product imageUrls:`, product.imageUrls);
        
        // Handle image URL with better logic
        let imageUrl = 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
        
        // Try to get image from different sources
        if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            if (typeof firstImage === 'string') {
                imageUrl = firstImage;
            } else if (firstImage && firstImage.url) {
                imageUrl = firstImage.url;
            }
        } else if (product.imageUrls && product.imageUrls.length > 0) {
            imageUrl = product.imageUrls[0];
        }
        
        // Skip broken "has_images" placeholder
        if (imageUrl === 'has_images' || imageUrl === '') {
            imageUrl = 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
        }
        
        console.log(`Final image URL for ${product.name}:`, imageUrl);
        
        const price = product.price ? `₹${product.price.toLocaleString()}` : 'Price not available';
        
        // Determine category filter
        let categoryFilter = 'all';
        if (product.subcategory?.slug) {
            categoryFilter = product.subcategory.slug.toLowerCase();
        } else if (product.subcategory?.name) {
            categoryFilter = product.subcategory.name.toLowerCase().replace(/\\s+/g, '-');
        }
        
        const productCard = `
            <div class="product-card" data-category="${categoryFilter}" onclick="goToDetail('${product._id}')">
                <div class="product-image-container">
                    <img src="${imageUrl}" 
                         class="product-image" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/400x500/ff6b6b/ffffff?text=Image+Error'; console.log('Image failed to load:', this.src);"
                         onload="console.log('Image loaded successfully:', this.src);">
                    <div class="product-overlay">
                        <div class="overlay-content">
                            <button class="quick-view-btn" onclick="event.stopPropagation(); viewProductDetails('${product._id}')">Quick View</button>
                        </div>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${price}</div>
                    <div class="product-rating">
                        ${generateStars(product.rating || 5)}
                    </div>
                    <div class="product-category">
                        <small>Category: ${product.category?.name || 'Men'}</small>
                    </div>
                </div>
            </div>
        `;
        
        allProductsHTML += productCard;
    });
    
    // Set all HTML at once
    productGrid.innerHTML = allProductsHTML;
    
    console.log(`✅ Displayed ${products.length} products - HTML length: ${productGrid.innerHTML.length}`);
    
    // Re-apply active filter if one is selected
    const activeFilter = document.querySelector('.filter-tab.active');
    if (activeFilter && activeFilter.getAttribute('data-filter') !== 'all') {
        activeFilter.click();
    }
}

// Show no products message
function showNoProducts(message) {
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-box-open" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">${message}</h3>
                <p style="color: #999;">Add products via admin panel to see them here!</p>
            </div>
        `;
    }
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '<i class="fas fa-star star"></i>';
        } else {
            starsHTML += '<i class="far fa-star star"></i>';
        }
    }
    
    return starsHTML;
}

// View product details
function viewProductDetails(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Go to detail page
function goToDetail(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Load products when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, loading men\'s products...');
    
    // Check if API_BASE_URL is available
    if (!window.API_BASE_URL) {
        console.error('❌ API_BASE_URL not found! Make sure api-config.js is loaded.');
        showNoProducts('Configuration error: API URL not found');
        return;
    }
    
    console.log('🔗 Using API URL:', window.API_BASE_URL);
    loadMensProducts();
});

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);