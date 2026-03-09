// Men's Products Dynamic Loader - FIXED VERSION WITH PAGINATION
console.log('🔵 Men\'s products loader initialized - FIXED VERSION WITH PAGINATION');

// Global pagination state
let currentPage = 1;
let totalPages = 1;
let currentFilter = 'all';

// Load men's products from API with pagination
async function loadMensProducts(page = 1, filter = 'all') {
    console.log(`📦 Starting to fetch men\'s products... Page: ${page}, Filter: ${filter}`);
    
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) {
        console.error('❌ Product grid element not found!');
        return;
    }

    // Update global state
    currentPage = page;
    currentFilter = filter;

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

        const apiUrl = `${window.API_BASE_URL}/products/category/men?limit=1000`;
        console.log('🔗 Fetching from:', apiUrl);
        
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
        
        let products = data.data.products;
        
        console.log(`✅ Successfully loaded ${products.length} products:`, products);
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-box-open" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">No Men's Products Found</h3>
                    <p style="color: #999;">Add products via admin panel to see them here!</p>
                </div>
            `;
            hidePagination();
            return;
        }
        
        // Apply pagination to all products
        const itemsPerPage = 12;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = products.slice(startIndex, endIndex);
        
        // Create pagination info
        const pagination = {
            page: page,
            pages: Math.ceil(products.length / itemsPerPage),
            total: products.length
        };
        
        console.log(`📄 Pagination: Page ${page} of ${pagination.pages}, showing ${paginatedProducts.length} products`);
        
        // Update global pagination state
        totalPages = pagination.pages;
        
        displayMensProducts(paginatedProducts);
        updatePagination(pagination);
        
    } catch (error) {
        console.error('❌ Error loading men\'s products:', error);
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">Error Loading Products</h3>
                <p style="color: #999;">${error.message}</p>
                <button onclick="loadMensProducts(${page}, '${filter}')" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
            </div>
        `;
        hidePagination();
    }
}

// Display products in the grid - ORIGINAL FUNCTION (not wrapped)
function displayMensProducts(products) {
    console.log('🎯 displayMensProducts called with:', products.length, 'products');
    
    // Store products for sorting
    currentPageProducts = products;
    
    // Update products count
    const productsCountEl = document.getElementById('productsCount');
    if (productsCountEl) {
        productsCountEl.textContent = `${products.length} Products Found`;
    }
    
    // Apply sort and render
    const sortedProducts = applySortToProducts(products);
    renderMensProducts(sortedProducts);
}

// Render products to grid
function renderMensProducts(products) {
    console.log('🎨 renderMensProducts called with', products.length, 'products');
    console.log('📋 Products to render:', products.map(p => ({ name: p.name, subcategory: p.subcategory?.name || 'NONE' })));
    
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) {
        console.error('❌ Product grid not found');
        return;
    }
    
    // Update products count
    const productsCountEl = document.getElementById('productsCount');
    if (productsCountEl) {
        productsCountEl.textContent = `${products.length} Products Found`;
    }
    
    let allProductsHTML = '';
    
    products.forEach((product, index) => {
        console.log(`🔄 Processing product ${index + 1}: ${product.name}`);
        console.log(`   Product ID: ${product._id}`);
        
        // Validate product ID
        if (!product._id) {
            console.error(`❌ Product ${product.name} has no _id!`);
            return; // Skip this product
        }
        
        // Handle image URL - improved logic with color variant fallback
        let imageUrl = 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
        
        console.log(`🔍 Product ${product.name} image data:`, {
            images: product.images,
            imageUrls: product.imageUrls,
            firstImage: product.images?.[0],
            hasColorVariants: product.hasColorVariants,
            colorVariants: product.colorVariants
        });
        
        // Helper function to process image URL
        function processImageUrl(imgUrl) {
            if (!imgUrl || imgUrl === 'has_images' || imgUrl === '') return null;
            
            if (imgUrl.startsWith('http')) {
                return imgUrl; // Full URL
            } else if (imgUrl.startsWith('uploads/')) {
                return '/' + imgUrl; // Relative path from root
            } else if (imgUrl.startsWith('/uploads/')) {
                return imgUrl; // Already has leading slash
            } else {
                return '/uploads/products/' + imgUrl; // Just filename
            }
        }
        
        // Try regular product images first
        if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            if (typeof firstImage === 'string') {
                const processedUrl = processImageUrl(firstImage);
                if (processedUrl) imageUrl = processedUrl;
            } else if (firstImage && firstImage.url) {
                const processedUrl = processImageUrl(firstImage.url);
                if (processedUrl) imageUrl = processedUrl;
            }
        } else if (product.imageUrls && product.imageUrls.length > 0) {
            const processedUrl = processImageUrl(product.imageUrls[0]);
            if (processedUrl) imageUrl = processedUrl;
        }
        // NEW: Fallback to color variant images if no regular images
        else if (product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0) {
            console.log(`🎨 No regular images found, checking color variants for ${product.name}`);
            
            // Find the first active color variant with images
            const variantWithImages = product.colorVariants.find(variant => 
                variant.isActive !== false && variant.images && variant.images.length > 0
            );
            
            if (variantWithImages) {
                console.log(`🎨 Found color variant with images: ${variantWithImages.colorName}`);
                
                // Use the primary image or first image from the color variant
                const primaryImage = variantWithImages.images.find(img => img.isPrimary) || variantWithImages.images[0];
                
                if (primaryImage && primaryImage.url) {
                    const processedUrl = processImageUrl(primaryImage.url);
                    if (processedUrl) {
                        imageUrl = processedUrl;
                        console.log(`🎨 Using color variant image: ${imageUrl}`);
                    }
                }
            } else {
                console.log(`🎨 No color variants with images found for ${product.name}`);
            }
        }
        
        // Final check: Skip broken "has_images" placeholder or empty URLs
        if (imageUrl === 'has_images' || imageUrl === '/has_images' || imageUrl === '' || imageUrl === '/' || imageUrl === 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image') {
            // If we still don't have a valid image, try one more time with color variants
            if (product.hasColorVariants && product.colorVariants && product.colorVariants.length > 0) {
                console.log(`🔄 Final attempt: checking all color variants for ${product.name}`);
                
                for (const variant of product.colorVariants) {
                    if (variant.images && variant.images.length > 0) {
                        const anyImage = variant.images[0];
                        if (anyImage && anyImage.url) {
                            const processedUrl = processImageUrl(anyImage.url);
                            if (processedUrl && processedUrl !== imageUrl) {
                                imageUrl = processedUrl;
                                console.log(`🎨 Final fallback image found: ${imageUrl}`);
                                break;
                            }
                        }
                    }
                }
            }
            
            // If still no valid image, use placeholder
            if (imageUrl === 'has_images' || imageUrl === '/has_images' || imageUrl === '' || imageUrl === '/') {
                imageUrl = 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
            }
        }
        
        console.log(`🖼️ Final Image URL for ${product.name}:`, imageUrl);
        
        // Handle pricing and discount display
        let priceDisplay = '';
        let saleBadge = ''; // Sale badge for top-left corner
        let trendingBadge = ''; // Trending badge
        let originalPrice = product.price;
        let finalPrice = product.price;
        
        // Check if product is trending
        if (product.trending) {
            trendingBadge = `<div class="trending-badge">TRENDING</div>`;
        }
        
        // Check if product has discount from backend
        if (product.discount && product.discount.isOnSale && product.discount.percentage > 0) {
            finalPrice = product.discount.salePrice || Math.round(originalPrice * (1 - product.discount.percentage / 100));
            
            priceDisplay = `
                <div class="price-container">
                    <span class="current-price">₹${finalPrice.toLocaleString()}</span>
                    <span class="original-price">₹${originalPrice.toLocaleString()}</span>
                </div>
                <div class="discount-info">
                    <span class="discount-percentage">${product.discount.percentage}% OFF</span>
                    <span class="savings">Save ₹${(originalPrice - finalPrice).toLocaleString()}</span>
                </div>
            `;
            
            saleBadge = `<div class="sale-badge">Sale</div>`; // Red Sale badge only
        } else {
            priceDisplay = `<div class="price-container"><span class="current-price">₹${originalPrice.toLocaleString()}</span></div>`;
        }
        
        // Determine category filter using the helper function
        const categoryFilter = getProductCategory(product);
        
        // Check if product is out of stock
        const isOutOfStock = product.stock !== undefined && product.stock === 0;
        const outOfStockClass = isOutOfStock ? 'out-of-stock' : '';
        const outOfStockOverlay = isOutOfStock ? '<div class="out-of-stock-overlay"><div class="out-of-stock-text">Out of Stock</div></div>' : '';
        
        const productCard = `
            <div class="product-card ${outOfStockClass}" data-category="${categoryFilter}" data-product-id="${product._id}" onclick="console.log('Clicked product:', '${product._id}', '${product.name}'); goToDetail('${product._id}')">
                <div class="product-image-container">
                    ${saleBadge}
                    <img src="${imageUrl}" 
                         class="product-image" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/400x500/ff6b6b/ffffff?text=Image+Error'">
                    ${outOfStockOverlay}
                    <div class="wishlist-icon" onclick="event.stopPropagation(); toggleWishlist('${product._id}', '${product.name}', '${imageUrl}', ${finalPrice})">
                        <i class="far fa-heart"></i>
                    </div>
                    <div class="product-overlay">
                        <div class="overlay-content">
                            <button class="quick-view-btn" onclick="event.stopPropagation(); viewProductDetails('${product._id}')">Quick View</button>
                        </div>
                    </div>
                </div>
                <div class="product-info">
                    ${trendingBadge}
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${priceDisplay}</div>
                    <div class="product-rating">
                        ${generateStars(product.rating || 0)}
                        <span class="rating-count">(${product.numReviews || 0})</span>
                    </div>
                </div>
            </div>
        `;
        
        // Debug logging for rating
        if (product.rating > 0 || product.numReviews > 0) {
            console.log(`⭐ Product with rating: ${product.name} - ${product.rating}★ (${product.numReviews} reviews)`);
        }
        
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
    console.log('🔗 goToDetail called with ID:', productId);
    console.log('🔗 Navigating to: product.html?id=' + productId);
    window.location.href = `product.html?id=${productId}`;
}

// Add CSS for loading animation on page load
(function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
})();

// Update pagination UI
function updatePagination(pagination) {
    const paginationContainer = document.getElementById('paginationContainer');
    const paginationList = document.getElementById('paginationList');
    
    if (!paginationContainer || !paginationList) {
        console.warn('Pagination elements not found');
        return;
    }
    
    // Hide pagination if only one page
    if (pagination.pages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    // Show pagination
    paginationContainer.style.display = 'block';
    
    let paginationHTML = '';
    
    // Previous button
    const prevDisabled = pagination.page <= 1 ? 'disabled' : '';
    paginationHTML += `
        <li class="page-item ${prevDisabled}">
            <a class="page-link" href="#" onclick="changePage(${pagination.page - 1}); return false;" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    
    // Page numbers
    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);
    
    // First page if not in range
    if (startPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Page range
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === pagination.page ? 'active' : '';
        paginationHTML += `
            <li class="page-item ${activeClass}">
                <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    // Last page if not in range
    if (endPage < pagination.pages) {
        if (endPage < pagination.pages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${pagination.pages}); return false;">${pagination.pages}</a>
            </li>
        `;
    }
    
    // Next button
    const nextDisabled = pagination.page >= pagination.pages ? 'disabled' : '';
    paginationHTML += `
        <li class="page-item ${nextDisabled}">
            <a class="page-link" href="#" onclick="changePage(${pagination.page + 1}); return false;" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    paginationList.innerHTML = paginationHTML;
    
    // Scroll to top of products section
    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Hide pagination
function hidePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (paginationContainer) {
        paginationContainer.style.display = 'none';
    }
}

// Change page function
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }
    
    console.log(`📄 Changing to page ${page}`);
    loadMensProducts(page, currentFilter);
}

// Update filter functionality to work with pagination and API filtering
function applyFilter(filterValue) {
    console.log(`🔍 Applying filter: ${filterValue}`);
    currentFilter = filterValue;
    
    if (filterValue === 'all') {
        // Load all men's products
        loadMensProducts(1, 'all');
    } else {
        // For specific filters, we need to filter client-side since API doesn't support subcategory filtering
        // First load all products, then filter them
        loadMensProductsWithFilter(1, filterValue);
    }
}

// Load men's products and apply client-side filtering - ALL PRODUCTS (NO PAGINATION)
async function loadMensProductsWithFilter(page = 1, filter = 'all') {
    console.log(`📦 Loading men's products with filter: ${filter}, page: ${page}`);
    
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) {
        console.error('❌ Product grid element not found!');
        return;
    }

    // Update global state
    currentPage = page;
    currentFilter = filter;

    // Show loading state
    productGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #65AAC3; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: #999;">Filtering men's products...</p>
        </div>
    `;

    try {
        // Load all men's products first
        const apiUrl = `${window.API_BASE_URL}/products/category/men?limit=1000`;
        console.log('🔗 Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success || !data.data || !data.data.products) {
            throw new Error('Invalid API response structure');
        }
        
        let products = data.data.products;
        console.log(`📦 Loaded ${products.length} total men's products`);
        
        // Apply client-side filtering
        if (filter !== 'all') {
            const beforeFilterCount = products.length;
            products = products.filter(product => {
                const productCategory = getProductCategory(product);
                const normalizedProductCategory = productCategory.toLowerCase().replace(/\s+/g, '-');
                const normalizedFilter = filter.toLowerCase().replace(/\s+/g, '-');
                
                const matches = normalizedProductCategory === normalizedFilter;
                
                if (!matches) {
                    console.log(`❌ FILTERED OUT: "${product.name}" | Category: "${productCategory}" (${normalizedProductCategory}) | Filter: "${normalizedFilter}"`);
                } else {
                    console.log(`✅ MATCHED: "${product.name}" | Category: "${productCategory}" (${normalizedProductCategory})`);
                }
                
                return matches;
            });
            
            console.log(`\n📊 FILTER SUMMARY:`);
            console.log(`   Before: ${beforeFilterCount} products`);
            console.log(`   After: ${products.length} products`);
            console.log(`   Filter: "${filter}"\n`);
        }
        
        // Apply pagination to filtered results
        const itemsPerPage = 12;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = products.slice(startIndex, endIndex);
        
        // Create pagination info
        const pagination = {
            page: page,
            pages: Math.ceil(products.length / itemsPerPage),
            total: products.length
        };
        
        console.log(`📄 Pagination: Page ${page} of ${pagination.pages}, showing ${paginatedProducts.length} products`);
        
        // Update global pagination state
        totalPages = pagination.pages;
        
        if (paginatedProducts.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-search" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">No Products Found</h3>
                    <p style="color: #999;">No men's products match the "${filter}" filter.</p>
                    <button onclick="applyFilter('all')" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Show All Products</button>
                </div>
            `;
            hidePagination();
            return;
        }
        
        displayMensProducts(paginatedProducts);
        updatePagination(pagination);
        
    } catch (error) {
        console.error('❌ Error loading filtered men\'s products:', error);
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">Error Loading Products</h3>
                <p style="color: #999;">${error.message}</p>
                <button onclick="loadMensProductsWithFilter(${page}, '${filter}')" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
            </div>
        `;
        hidePagination();
    }
}

// Helper function to determine product category for filtering
function getProductCategory(product) {
    // Priority-based category detection
    
    // 1. Check subcategory slug (most reliable)
    if (product.subcategory?.slug) {
        const slug = product.subcategory.slug.toLowerCase();
        if (slug === 'shirts' || slug === 'shirt') return 'shirts';
        if (slug === 't-shirts' || slug === 't-shirt' || slug === 'tshirts' || slug === 'tshirt') return 't-shirts';
        if (slug === 'jackets' || slug === 'jacket') return 'jackets';
        if (slug === 'jeans' || slug === 'jean') return 'jeans';
        if (slug === 'accessories' || slug === 'accessory') return 'accessories';
    }
    
    // 2. Check subcategory name
    if (product.subcategory?.name) {
        const name = product.subcategory.name.toLowerCase();
        if (name.includes('shirt') && !name.includes('t-shirt') && !name.includes('tshirt')) return 'shirts';
        if (name.includes('t-shirt') || name.includes('tshirt')) return 't-shirts';
        if (name.includes('jacket')) return 'jackets';
        if (name.includes('jean')) return 'jeans';
        if (name.includes('accessor')) return 'accessories';
    }
    
    // 3. Check product name (fallback for products without subcategory)
    if (product.name) {
        const name = product.name.toLowerCase();
        
        // More comprehensive name matching
        // Shirts (but not T-Shirts)
        if ((name.includes('shirt') || name.includes('button') || name.includes('dress shirt') || name.includes('formal')) 
            && !name.includes('t-shirt') && !name.includes('tshirt') && !name.includes('tee')) {
            return 'shirts';
        }
        
        // T-Shirts
        if (name.includes('t-shirt') || name.includes('tshirt') || name.includes('tee') || name.includes('polo')) {
            return 't-shirts';
        }
        
        // Jackets
        if (name.includes('jacket') || name.includes('coat') || name.includes('blazer') || name.includes('hoodie') || name.includes('sweater') || name.includes('cardigan')) {
            return 'jackets';
        }
        
        // Jeans
        if (name.includes('jean') || name.includes('denim') || name.includes('trouser') || name.includes('pant') || name.includes('cargo')) {
            return 'jeans';
        }
        
        // Accessories
        if (name.includes('accessor') || name.includes('belt') || name.includes('wallet') || name.includes('bag') || name.includes('watch') || name.includes('cap') || name.includes('hat')) {
            return 'accessories';
        }
    }
    
    // Default fallback
    return 'all';
}

// Update the changePage function to work with filters
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) {
        return;
    }
    
    console.log(`📄 Changing to page ${page} with filter: ${currentFilter}`);
    
    if (currentFilter === 'all') {
        loadMensProducts(page, currentFilter);
    } else {
        loadMensProductsWithFilter(page, currentFilter);
    }
}



// Sort functionality
let currentSortBy = 'featured';
let currentPageProducts = []; // Store current page products for sorting

// Initialize sort dropdown
document.addEventListener('DOMContentLoaded', function() {
    const sortSelect = document.getElementById('sortBySelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            // If empty value (placeholder), default to featured
            currentSortBy = this.value || 'featured';
            console.log('🔄 Sort changed to:', currentSortBy);
            // Re-render current page products with new sort
            if (currentPageProducts && currentPageProducts.length > 0) {
                const sortedProducts = applySortToProducts(currentPageProducts);
                renderMensProducts(sortedProducts);
            }
        });
    }
    
    // Initialize products on page load
    loadMensProducts(1, 'all');
});

// Function to apply sort to products (returns sorted array)
function applySortToProducts(products) {
    if (!products || products.length === 0) return products;
    
    let sortedProducts = [...products];
    
    switch(currentSortBy) {
        case 'availability':
            // Filter out out-of-stock products and sort by stock quantity
            sortedProducts = sortedProducts.filter(product => {
                return product.stock !== undefined && product.stock > 0;
            });
            sortedProducts.sort((a, b) => (b.stock || 0) - (a.stock || 0));
            break;
        case 'price-low':
            sortedProducts.sort((a, b) => {
                const priceA = a.discount?.isOnSale ? a.discount.salePrice : a.price;
                const priceB = b.discount?.isOnSale ? b.discount.salePrice : b.price;
                return priceA - priceB;
            });
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => {
                const priceA = a.discount?.isOnSale ? a.discount.salePrice : a.price;
                const priceB = b.discount?.isOnSale ? b.discount.salePrice : b.price;
                return priceB - priceA;
            });
            break;
        case 'newest':
            sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            sortedProducts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'discount':
            sortedProducts.sort((a, b) => {
                const discountA = a.discount?.isOnSale ? a.discount.percentage : 0;
                const discountB = b.discount?.isOnSale ? b.discount.percentage : 0;
                return discountB - discountA;
            });
            break;
        case 'featured':
        default:
            // Featured products first, then by creation date
            sortedProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            break;
    }
    
    return sortedProducts;
}

// Quick filter function for category tabs
function applyQuickFilter(category) {
    console.log(`🔍 Quick filter applied: ${category}`);
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-filter') === category) {
            tab.classList.add('active');
        }
    });
    
    // Apply the filter
    applyFilter(category);
}

// Comprehensive filter function for filter panel
function applyFilters() {
    console.log('🔍 Applying comprehensive filters from panel...');
    
    // Get selected categories - simpler approach
    const selectedCategories = [];
    const allCheckboxes = document.querySelectorAll('.filter-group input[type="checkbox"]');
    
    allCheckboxes.forEach(checkbox => {
        // Only include if it's checked and NOT a discount, brand, rating, or availability checkbox
        if (checkbox.checked && 
            checkbox.name !== 'discount' &&
            checkbox.name !== 'brand' &&
            checkbox.name !== 'rating' &&
            checkbox.name !== 'availability') {
            selectedCategories.push(checkbox.value);
        }
    });
    
    console.log('📂 Selected categories:', selectedCategories);
    
    // Get selected brands
    const selectedBrands = [];
    const brandCheckboxes = document.querySelectorAll('input[name="brand"]:checked');
    brandCheckboxes.forEach(checkbox => {
        selectedBrands.push(checkbox.value);
    });
    
    console.log('🏷️ Selected brands:', selectedBrands);
    
    // Get availability filter (default to 'in-stock' since we removed 'all')
    const availabilityRadio = document.querySelector('input[name="availability"]:checked');
    const availability = availabilityRadio ? availabilityRadio.value : 'in-stock';
    
    // Get price range
    const minPrice = parseInt(document.getElementById('minPrice')?.value || 0);
    const maxPrice = parseInt(document.getElementById('maxPrice')?.value || 999999);
    
    // Get discount filter - if nothing checked, show all products
    const discountCheckboxes = document.querySelectorAll('input[name="discount"]:checked');
    const selectedDiscounts = [];
    
    console.log('🏷️ Discount checkboxes found:', discountCheckboxes.length);
    
    discountCheckboxes.forEach(checkbox => {
        const value = parseInt(checkbox.value);
        console.log('   Checkbox value:', value, 'checked:', checkbox.checked);
        selectedDiscounts.push(value);
    });
    
    console.log('🏷️ Selected discounts:', selectedDiscounts);
    
    // Get rating filter
    const ratingRadio = document.querySelector('input[name="rating"]:checked');
    const minRating = ratingRadio ? parseInt(ratingRadio.value) : 0;
    
    console.log('📊 Filter criteria:', {
        categories: selectedCategories,
        brands: selectedBrands,
        availability,
        priceRange: [minPrice, maxPrice],
        discounts: selectedDiscounts,
        minRating
    });
    
    // Load and filter products
    loadAndFilterProducts(selectedCategories, selectedBrands, availability, minPrice, maxPrice, selectedDiscounts, minRating);
}

// Load and filter products with all criteria
async function loadAndFilterProducts(categories, brands, availability, minPrice, maxPrice, discounts, minRating) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;
    
    // Show loading
    productGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #65AAC3; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: #999;">Applying filters...</p>
        </div>
    `;
    
    try {
        // Load all men's products
        const apiUrl = `${window.API_BASE_URL}/products/category/men?limit=1000`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (!data.success || !data.data || !data.data.products) {
            throw new Error('Failed to load products');
        }
        
        let products = data.data.products;
        console.log(`📦 Loaded ${products.length} products, applying filters...`);
        
        // Apply category filter
        if (categories.length > 0) {
            products = products.filter(product => {
                const productCategory = getProductCategory(product);
                return categories.includes(productCategory);
            });
            console.log(`✅ After category filter: ${products.length} products`);
        }
        
        // Apply brand filter
        if (brands.length > 0) {
            products = products.filter(product => {
                const productBrandId = product.brand?._id || product.brand;
                const productBrandName = product.brand?.name || product.brandName || '';
                
                return brands.some(brandId => {
                    return brandId === productBrandId || 
                           brandId === productBrandName.toLowerCase() ||
                           brandId === productBrandName;
                });
            });
            console.log(`✅ After brand filter: ${products.length} products`);
        }
        
        // Apply availability filter
        if (availability === 'in-stock') {
            products = products.filter(product => product.stock > 0);
            console.log(`✅ After availability filter (in-stock): ${products.length} products`);
        } else if (availability === 'out-of-stock') {
            products = products.filter(product => product.stock === 0);
            console.log(`✅ After availability filter (out-of-stock): ${products.length} products`);
        }
        
        // Apply price filter
        products = products.filter(product => {
            const price = product.discount?.isOnSale ? product.discount.salePrice : product.price;
            return price >= minPrice && price <= maxPrice;
        });
        console.log(`✅ After price filter (${minPrice}-${maxPrice}): ${products.length} products`);
        
        // Apply discount filter
        if (discounts.length > 0) {
            const minDiscount = Math.min(...discounts);
            console.log(`\n🏷️ APPLYING DISCOUNT FILTER: Minimum ${minDiscount}%`);
            console.log(`📦 Products before discount filter: ${products.length}`);
            
            const beforeFilter = products.length;
            products = products.filter(product => {
                // Check if product has discount and is on sale
                if (!product.discount) {
                    console.log(`   ❌ "${product.name}" - No discount object`);
                    return false;
                }
                
                if (!product.discount.isOnSale) {
                    console.log(`   ❌ "${product.name}" - Not on sale (isOnSale: ${product.discount.isOnSale})`);
                    return false;
                }
                
                const discount = product.discount.percentage || 0;
                const matches = discount >= minDiscount;
                
                if (matches) {
                    console.log(`   ✅ "${product.name}" - ${discount}% discount (>= ${minDiscount}%) - INCLUDED`);
                } else {
                    console.log(`   ❌ "${product.name}" - ${discount}% discount (< ${minDiscount}%) - EXCLUDED`);
                }
                
                return matches;
            });
            
            console.log(`\n✅ After discount filter (>=${minDiscount}%): ${products.length} products (filtered out ${beforeFilter - products.length})`);
        } else {
            console.log('🏷️ No discount filter applied (showing all products)');
        }
        
        // Apply rating filter
        if (minRating > 0) {
            products = products.filter(product => {
                const rating = product.rating || 0;
                return rating >= minRating;
            });
            console.log(`✅ After rating filter (>=${minRating}★): ${products.length} products`);
        }
        
        // Apply pagination
        const itemsPerPage = 12;
        const totalPages = Math.ceil(products.length / itemsPerPage);
        const paginatedProducts = products.slice(0, itemsPerPage);
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-search" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">No Products Found</h3>
                    <p style="color: #999;">Try adjusting your filters to see more products.</p>
                    <button onclick="clearAllFilters()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Clear All Filters</button>
                </div>
            `;
            hidePagination();
            return;
        }
        
        displayMensProducts(paginatedProducts);
        updatePagination({
            page: 1,
            pages: totalPages,
            total: products.length
        });
        
    } catch (error) {
        console.error('❌ Error filtering products:', error);
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">Error Loading Products</h3>
                <p style="color: #999;">${error.message}</p>
            </div>
        `;
        hidePagination();
    }
}

// Clear all filters
function clearAllFilters() {
    console.log('🔄 Clearing all filters...');
    
    // Reset category checkboxes
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = checkbox.value === 'all';
    });
    
    // Reset availability radio
    document.querySelectorAll('input[name="availability"]').forEach(radio => {
        radio.checked = radio.value === 'all';
    });
    
    // Reset price range
    if (document.getElementById('minPrice')) document.getElementById('minPrice').value = 0;
    if (document.getElementById('maxPrice')) document.getElementById('maxPrice').value = 10000;
    
    // Reset discount checkboxes
    document.querySelectorAll('input[name="discount"]').forEach(checkbox => {
        checkbox.checked = checkbox.value === '0';
    });
    
    // Reset rating radio
    document.querySelectorAll('input[name="rating"]').forEach(radio => {
        radio.checked = radio.value === '0';
    });
    
    // Reset category tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-filter') === 'all') {
            tab.classList.add('active');
        }
    });
    
    // Reload all products
    loadMensProducts(1, 'all');
}

// Filter panel toggle functions
function openFilterPanel() {
    document.getElementById('filterPanel').classList.add('active');
    document.getElementById('filterOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFilterPanel() {
    document.getElementById('filterPanel').classList.remove('active');
    document.getElementById('filterOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function toggleFilterGroup(element) {
    const filterContent = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    filterContent.classList.toggle('active');
    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}

// Handle discount checkbox behavior - simplified without "All Products"
function setupDiscountCheckboxes() {
    const discountCheckboxes = document.querySelectorAll('input[name="discount"]');
    
    if (discountCheckboxes.length === 0) {
        console.log('⚠️ No discount checkboxes found yet');
        return;
    }
    
    console.log('✅ Setting up', discountCheckboxes.length, 'discount checkboxes');
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Content Loaded - setting up discount checkboxes');
    setupDiscountCheckboxes();
    
    // Try again after a short delay in case elements load later
    setTimeout(() => {
        console.log('⏰ Delayed setup - trying again');
        setupDiscountCheckboxes();
    }, 1000);
});

// Sorting from menu
function applySortingFromMenu(sortType) {
    currentSortBy = sortType;
    console.log('🔄 Sort changed to:', sortType);
    
    // Close sort menu
    const sortMenu = document.querySelector('.sort-menu');
    if (sortMenu) sortMenu.classList.remove('active');
    
    // Re-render current products with new sort
    if (currentPageProducts && currentPageProducts.length > 0) {
        const sortedProducts = applySortToProducts(currentPageProducts);
        renderMensProducts(sortedProducts);
    }
}
