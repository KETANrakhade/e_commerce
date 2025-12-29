// Men's Products Dynamic Loader - FIXED VERSION
console.log('🔵 Men\'s products loader initialized - FIXED VERSION');

// Load men's products from API
async function loadMensProducts() {
    console.log('📦 Starting to fetch men\'s products...');
    
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) {
        console.error('❌ Product grid element not found!');
        return;
    }

    // Show loading state
    productGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #65AAC3; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: #999;">Loading men's products...</p>
        </div>
    `;

    try {
        console.log('🔗 API URL:', window.API_BASE_URL);
        
        if (!window.API_BASE_URL) {
            throw new Error('API_BASE_URL not defined. Make sure api-config.js is loaded.');
        }

        const apiUrl = `${window.API_BASE_URL}/products/category/men`;
        console.log('📡 Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📦 Raw API response:', data);
        
        if (!data.success) {
            throw new Error('API returned success=false: ' + (data.error || 'Unknown error'));
        }
        
        if (!data.data || !data.data.products) {
            throw new Error('Invalid API response structure');
        }
        
        const products = data.data.products;
        console.log(`✅ Successfully loaded ${products.length} products:`, products);
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-box-open" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">No Men's Products Found</h3>
                    <p style="color: #999;">Add products via admin panel to see them here!</p>
                </div>
            `;
            return;
        }
        
        displayMensProducts(products);
        
    } catch (error) {
        console.error('❌ Error loading men\'s products:', error);
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">Error Loading Products</h3>
                <p style="color: #999;">${error.message}</p>
                <button onclick="loadMensProducts()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
            </div>
        `;
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
    
    let allProductsHTML = '';
    
    products.forEach((product, index) => {
        console.log(`🔄 Processing product ${index + 1}: ${product.name}`);
        
        // Handle image URL - improved logic
        let imageUrl = 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
        
        if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            if (typeof firstImage === 'string' && firstImage !== 'has_images' && firstImage !== '') {
                // Ensure the path starts from root
                imageUrl = firstImage.startsWith('/') ? firstImage : '/' + firstImage;
            } else if (firstImage && firstImage.url && firstImage.url !== 'has_images' && firstImage.url !== '') {
                // Ensure the path starts from root
                imageUrl = firstImage.url.startsWith('/') ? firstImage.url : '/' + firstImage.url;
            }
        } else if (product.imageUrls && product.imageUrls.length > 0) {
            const firstUrl = product.imageUrls[0];
            if (firstUrl && firstUrl !== 'has_images' && firstUrl !== '') {
                // Ensure the path starts from root
                imageUrl = firstUrl.startsWith('/') ? firstUrl : '/' + firstUrl;
            }
        }
        
        // Final check: Skip broken "has_images" placeholder or empty URLs
        if (imageUrl === 'has_images' || imageUrl === '/has_images' || imageUrl === '' || imageUrl === '/') {
            imageUrl = 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
        }
        
        console.log(`🖼️ Image URL for ${product.name}:`, imageUrl);
        
        const price = product.price ? `₹${product.price.toLocaleString()}` : 'Price not available';
        
        // Determine category filter
        let categoryFilter = 'all';
        if (product.subcategory?.slug) {
            categoryFilter = product.subcategory.slug.toLowerCase();
        } else if (product.subcategory?.name) {
            categoryFilter = product.subcategory.name.toLowerCase().replace(/\s+/g, '-');
        }
        
        const productCard = `
            <div class="product-card" data-category="${categoryFilter}" onclick="goToDetail('${product._id}')">
                <div class="product-image-container">
                    <img src="${imageUrl}" 
                         class="product-image" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/400x500/ff6b6b/ffffff?text=Image+Error'">
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
    
    productGrid.innerHTML = allProductsHTML;
    console.log(`✅ Successfully displayed ${products.length} products`);
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
    console.log('📄 DOM loaded, initializing men\'s products loader...');
    
    // Add CSS for loading animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Wait a bit for other scripts to load
    setTimeout(() => {
        console.log('🚀 Starting product load...');
        loadMensProducts();
    }, 500);
});
        
        console.log(`✅ Loaded ${products.length} men's products`);
        
        displayMensProducts(products);
        
    } catch (error) {
        console.error('❌ Error loading men\'s products:', error);
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
    
    // Clear existing hardcoded products
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
        console.log('⚠️ No products to display');
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-box-open" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">No Men's Products Found</h3>
                <p style="color: #999;">Add products via admin panel to see them here!</p>
            </div>
        `;
        return;
    }
    
    console.log('🔄 Creating product cards...');
    
    let allProductsHTML = '';
    
    // Create product cards
    products.forEach((product, index) => {
        console.log(`Creating card ${index + 1}: ${product.name}`);
        
        const imageUrl = product.images?.[0]?.url || product.imageUrls?.[0] || 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
        const price = product.price ? `₹${product.price.toLocaleString()}` : 'Price not available';
        // Use subcategory name/slug for filtering, fallback to category name, then to product name analysis
        let categoryFilter = 'all';
        if (product.subcategory?.name) {
            categoryFilter = product.subcategory.name.toLowerCase().replace(/\s+/g, '-');
        } else if (product.subcategory?.slug) {
            categoryFilter = product.subcategory.slug.toLowerCase();
        } else if (product.category?.name) {
            categoryFilter = product.category.name.toLowerCase().replace(/\s+/g, '-');
        }
        
        // If no subcategory, analyze product name and tags to determine category
        if (categoryFilter === 'all' || categoryFilter === 'men') {
        
        // Map common product name patterns to filter categories
        const productNameLower = (product.name || '').toLowerCase();
        const subcategoryNameLower = (product.subcategory?.name || '').toLowerCase();
        const subcategorySlugLower = (product.subcategory?.slug || '').toLowerCase();
        
        // Priority-based category mapping - check most specific first
        // 1. Check subcategory slug (most reliable)
        if (subcategorySlugLower === 't-shirts' || subcategorySlugLower === 'tshirts' || subcategorySlugLower === 't-shirt') {
            categoryFilter = 't-shirts';
        } else if (subcategorySlugLower === 'shirts' || subcategorySlugLower === 'shirt') {
            categoryFilter = 'shirts';
        } else if (subcategorySlugLower === 'jackets' || subcategorySlugLower === 'jacket') {
            categoryFilter = 'jackets';
        } else if (subcategorySlugLower === 'jeans' || subcategorySlugLower === 'jean') {
            categoryFilter = 'jeans';
        } else if (subcategorySlugLower === 'accessories' || subcategorySlugLower === 'accessory') {
            categoryFilter = 'accessories';
        }
        // 2. Check subcategory name (second priority)
        else if (subcategoryNameLower.includes('t-shirt') || subcategoryNameLower.includes('tshirt') || subcategoryNameLower.includes('tee')) {
            categoryFilter = 't-shirts';
        } else if (subcategoryNameLower.includes('shirt') && !subcategoryNameLower.includes('t-shirt') && !subcategoryNameLower.includes('tshirt')) {
            categoryFilter = 'shirts';
        } else if (subcategoryNameLower.includes('jacket')) {
            categoryFilter = 'jackets';
        } else if (subcategoryNameLower.includes('jean')) {
            categoryFilter = 'jeans';
        } else if (subcategoryNameLower.includes('accessor')) {
            categoryFilter = 'accessories';
        }
        // 3. Check product name (fallback)
        else if (productNameLower.includes('t-shirt') || productNameLower.includes('tshirt') || productNameLower.includes('tee')) {
            categoryFilter = 't-shirts';
        } else if (productNameLower.includes('shirt') && !productNameLower.includes('t-shirt') && !productNameLower.includes('tshirt')) {
            categoryFilter = 'shirts';
        } else if (productNameLower.includes('jacket')) {
            categoryFilter = 'jackets';
        } else if (productNameLower.includes('jean')) {
            categoryFilter = 'jeans';
        } else if (productNameLower.includes('accessor')) {
            categoryFilter = 'accessories';
        }
        }
        
        // Debug logging
        console.log(`🔍 Product: "${product.name}" | Subcategory: "${product.subcategory?.name || 'N/A'}" | Slug: "${product.subcategory?.slug || 'N/A'}" | Assigned Filter: "${categoryFilter}"`);
        
        const productCard = `
            <div class="product-card" data-category="${categoryFilter}" onclick="goToDetail('${product._id}')">
                <div class="product-image-container">
                    <img src="${imageUrl}" 
                         class="product-image" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image'">
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
                    ${product.tags && product.tags.length > 0 ? `
                        <div class="product-tags">
                            ${product.tags.slice(0, 2).map(tag => `<span class="product-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
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
    loadMensProducts();
});
