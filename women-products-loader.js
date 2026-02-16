// Women's Products Dynamic Loader WITH PAGINATION
console.log('🔵 Women\'s products loader initialized');

// Global pagination state
let currentPage = 1;
let totalPages = 1;
let currentFilter = 'all';

// Load women's products from API with pagination
async function loadWomensProducts(page = 1, filter = 'all') {
    console.log(`📦 Starting to fetch women\'s products... Page: ${page}, Filter: ${filter}`);
    
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
            <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #FF69B4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: #999;">Loading women's products...</p>
        </div>
    `;

    try {
        console.log('🔗 API URL:', window.API_BASE_URL);
        
        if (!window.API_BASE_URL) {
            throw new Error('API_BASE_URL not defined. Make sure api-config.js is loaded.');
        }

        const apiUrl = `${window.API_BASE_URL}/products/category/women?page=${page}&limit=12`;
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
        
        const products = data.data.products;
        const pagination = {
            page: data.data.page || 1,
            pages: data.data.pages || 1,
            total: data.data.total || products.length
        };
        
        console.log(`✅ Successfully loaded ${products.length} products:`, products);
        console.log('📄 Pagination info:', pagination);
        
        // Update global pagination state
        totalPages = pagination.pages;
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-box-open" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">No Women's Products Found</h3>
                    <p style="color: #999;">Add products via admin panel to see them here!</p>
                </div>
            `;
            hidePagination();
            return;
        }
        
        displayWomensProducts(products);
        updatePagination(pagination);
        
    } catch (error) {
        console.error('❌ Error loading women\'s products:', error);
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">Error Loading Products</h3>
                <p style="color: #999;">${error.message}</p>
                <button onclick="loadWomensProducts(${page}, '${filter}')" style="margin-top: 15px; padding: 10px 20px; background: #FF69B4; color: white; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
            </div>
        `;
        hidePagination();
    }
}

// Display products in the grid - ORIGINAL FUNCTION (not wrapped)
function displayWomensProducts(products) {
    console.log('🎯 displayWomensProducts called with:', products.length, 'products');
    
    // Store products for sorting
    allProducts = products;
    
    // Apply sort and render
    const sortedProducts = applySortToProducts(products);
    renderWomensProducts(sortedProducts);
}

// Render products to grid
function renderWomensProducts(products) {
    console.log('🎯 renderWomensProducts called with:', products.length, 'products');
    
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
                <h3 style="color: #666; margin-bottom: 10px;">No Women's Products Found</h3>
                <p style="color: #999;">Add products via admin panel to see them here!</p>
            </div>
        `;
        return;
    }
    
    console.log('🔄 Creating product cards...');
    
    let allProductsHTML = '';
    
    // Create product cards
    products.forEach((product, index) => {
        // Handle image URL - improved logic with color variant fallback
        let imageUrl = 'https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=No+Image';
        
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
        if (imageUrl === 'has_images' || imageUrl === '/has_images' || imageUrl === '' || imageUrl === '/' || imageUrl === 'https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=No+Image') {
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
                imageUrl = 'https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=No+Image';
            }
        }
        
        console.log(`🖼️ Final Women's Image URL for ${product.name}:`, imageUrl);
        
        // Handle pricing and discount display
        let priceDisplay = '';
        let saleBadge = ''; // Sale badge for top-left corner
        let originalPrice = product.price;
        let finalPrice = product.price;
        
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
        if (categoryFilter === 'all' || categoryFilter === 'women') {
        
        // Map common product name patterns to filter categories
        const productNameLower = (product.name || '').toLowerCase();
        const subcategoryNameLower = (product.subcategory?.name || '').toLowerCase();
        const subcategorySlugLower = (product.subcategory?.slug || '').toLowerCase();
        
        // Priority-based category mapping - check most specific first
        // 1. Check subcategory slug (most reliable)
        if (subcategorySlugLower === 'shirts' || subcategorySlugLower === 'shirt') {
            categoryFilter = 'shirts';
        } else if (subcategorySlugLower === 'dresses' || subcategorySlugLower === 'dress') {
            categoryFilter = 'dresses';
        } else if (subcategorySlugLower === 'tops' || subcategorySlugLower === 'top') {
            categoryFilter = 'tops';
        } else if (subcategorySlugLower === 'jeans' || subcategorySlugLower === 'jean') {
            categoryFilter = 'jeans';
        } else if (subcategorySlugLower === 'accessories' || subcategorySlugLower === 'accessory') {
            categoryFilter = 'accessories';
        } else if (subcategorySlugLower === 'beauty') {
            categoryFilter = 'beauty';
        }
        // 2. Check subcategory name (second priority)
        else if (subcategoryNameLower.includes('shirt') && !subcategoryNameLower.includes('t-shirt') && !subcategoryNameLower.includes('tshirt')) {
            categoryFilter = 'shirts';
        } else if (subcategoryNameLower.includes('dress')) {
            categoryFilter = 'dresses';
        } else if (subcategoryNameLower.includes('top') && !subcategoryNameLower.includes('stop')) {
            categoryFilter = 'tops';
        } else if (subcategoryNameLower.includes('jean')) {
            categoryFilter = 'jeans';
        } else if (subcategoryNameLower.includes('accessor')) {
            categoryFilter = 'accessories';
        } else if (subcategoryNameLower.includes('beauty')) {
            categoryFilter = 'beauty';
        }
        // 3. Check product name (fallback)
        else if (productNameLower.includes('shirt') && !productNameLower.includes('t-shirt') && !productNameLower.includes('tshirt')) {
            categoryFilter = 'shirts';
        } else if (productNameLower.includes('dress')) {
            categoryFilter = 'dresses';
        } else if (productNameLower.includes('top') && !productNameLower.includes('stop')) {
            categoryFilter = 'tops';
        } else if (productNameLower.includes('jean')) {
            categoryFilter = 'jeans';
        } else if (productNameLower.includes('accessor')) {
            categoryFilter = 'accessories';
        } else if (productNameLower.includes('beauty') || productNameLower.includes('makeup') || productNameLower.includes('cosmetic')) {
            categoryFilter = 'beauty';
        }
        }
        
        // Debug logging
        console.log(`🔍 Product: "${product.name}" | Subcategory: "${product.subcategory?.name || 'N/A'}" | Slug: "${product.subcategory?.slug || 'N/A'}" | Assigned Filter: "${categoryFilter}"`);
        
        // Check if product is out of stock
        const isOutOfStock = product.stock !== undefined && product.stock === 0;
        const outOfStockClass = isOutOfStock ? 'out-of-stock' : '';
        const outOfStockBadge = isOutOfStock ? '<div class="out-of-stock-badge">OUT OF STOCK</div>' : '';
        
        const productCard = `
            <div class="product-card ${outOfStockClass}" data-category="${categoryFilter}" onclick="goToDetail('${product._id}')">
                <div class="product-image-container">
                    ${saleBadge}
                    <img src="${imageUrl}" 
                         class="product-image" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=No+Image'">
                    ${outOfStockBadge}
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
    
    // Set all HTML at once
    productGrid.innerHTML = allProductsHTML;
    
    console.log(`✅ Displayed ${products.length} products - HTML length: ${productGrid.innerHTML.length}`);
    
    // Update wishlist icons to reflect current wishlist state
    setTimeout(() => {
        if (typeof updateWishlistIcons === 'function') {
            updateWishlistIcons();
        }
    }, 100);
    
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
    loadWomensProducts(page, currentFilter);
}

// Update filter functionality to work with pagination
function applyFilter(filterValue) {
    console.log(`🔍 Applying filter: ${filterValue}`);
    currentFilter = filterValue;
    
    if (filterValue === 'all') {
        // Load all women's products
        loadWomensProducts(1, 'all');
    } else {
        // For specific filters, we need to filter client-side since API doesn't support subcategory filtering
        loadWomensProductsWithFilter(1, filterValue);
    }
}

// Load women's products and apply client-side filtering
async function loadWomensProductsWithFilter(page = 1, filter = 'all') {
    console.log(`📦 Loading women's products with filter: ${filter}, page: ${page}`);
    
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
            <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #FF69B4; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p style="color: #999;">Filtering women's products...</p>
        </div>
    `;

    try {
        // Load all women's products first
        const apiUrl = `${window.API_BASE_URL}/products/category/women`;
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
        console.log(`📦 Loaded ${products.length} total women's products`);
        
        // Apply client-side filtering
        if (filter !== 'all') {
            products = products.filter(product => {
                const productCategory = getProductCategory(product);
                const normalizedProductCategory = productCategory.toLowerCase().replace(/\s+/g, '-');
                const normalizedFilter = filter.toLowerCase().replace(/\s+/g, '-');
                
                console.log(`🔍 Product: "${product.name}" | Category: "${productCategory}" | Normalized: "${normalizedProductCategory}" | Filter: "${normalizedFilter}"`);
                
                return normalizedProductCategory === normalizedFilter;
            });
            
            console.log(`✅ After filtering: ${products.length} products match "${filter}"`);
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
                    <p style="color: #999;">No women's products match the "${filter}" filter.</p>
                    <button onclick="applyFilter('all')" style="margin-top: 15px; padding: 10px 20px; background: #FF69B4; color: white; border: none; border-radius: 5px; cursor: pointer;">Show All Products</button>
                </div>
            `;
            hidePagination();
            return;
        }
        
        displayWomensProducts(paginatedProducts);
        updatePagination(pagination);
        
    } catch (error) {
        console.error('❌ Error loading filtered women\'s products:', error);
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">Error Loading Products</h3>
                <p style="color: #999;">${error.message}</p>
                <button onclick="loadWomensProductsWithFilter(${page}, '${filter}')" style="margin-top: 15px; padding: 10px 20px; background: #FF69B4; color: white; border: none; border-radius: 5px; cursor: pointer;">Try Again</button>
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
        if (slug === 'dresses' || slug === 'dress') return 'dresses';
        if (slug === 'tops' || slug === 'top') return 'tops';
        if (slug === 'jeans' || slug === 'jean') return 'jeans';
        if (slug === 'accessories' || slug === 'accessory') return 'accessories';
        if (slug === 'beauty') return 'beauty';
    }
    
    // 2. Check subcategory name
    if (product.subcategory?.name) {
        const name = product.subcategory.name.toLowerCase();
        if (name.includes('shirt') && !name.includes('t-shirt') && !name.includes('tshirt')) return 'shirts';
        if (name.includes('dress')) return 'dresses';
        if (name.includes('top') && !name.includes('stop')) return 'tops';
        if (name.includes('jean')) return 'jeans';
        if (name.includes('accessor')) return 'accessories';
        if (name.includes('beauty')) return 'beauty';
    }
    
    // 3. Check product name (fallback)
    if (product.name) {
        const name = product.name.toLowerCase();
        if (name.includes('shirt') && !name.includes('t-shirt') && !name.includes('tshirt')) return 'shirts';
        if (name.includes('dress')) return 'dresses';
        if (name.includes('top') && !name.includes('stop')) return 'tops';
        if (name.includes('jean')) return 'jeans';
        if (name.includes('accessor')) return 'accessories';
        if (name.includes('beauty') || name.includes('makeup') || name.includes('cosmetic')) return 'beauty';
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
        loadWomensProducts(page, currentFilter);
    } else {
        loadWomensProductsWithFilter(page, currentFilter);
    }
}


// Sort functionality
let allProducts = []; // Store all products for sorting
let currentSortBy = 'featured';

// Initialize sort dropdown and load products
document.addEventListener('DOMContentLoaded', function() {
    const sortSelect = document.getElementById('sortBySelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            // If empty value (placeholder), default to featured
            currentSortBy = this.value || 'featured';
            console.log('🔄 Sort changed to:', currentSortBy);
            // Re-render current page products with new sort
            if (allProducts && allProducts.length > 0) {
                const sortedProducts = applySortToProducts(allProducts);
                renderWomensProducts(sortedProducts);
            }
        });
    }
    
    // Initialize products on page load
    loadWomensProducts(1, 'all');
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
