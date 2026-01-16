// Women's Products Dynamic Loader
console.log('🔵 Women\'s products loader initialized');

// Load women's products from API
async function loadWomensProducts() {
    try {
        console.log('📦 Fetching women\'s products...');
        
        // Try multiple category variations for women's products
        let data = null;
        const categoryVariations = ['women', 'female', 'womens'];
        
        for (const category of categoryVariations) {
            try {
                const response = await fetch(`${window.API_BASE_URL}/products/category/${category}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const responseData = await response.json();
                    if (responseData.data?.products?.length > 0) {
                        console.log(`✅ Found products using category: ${category}`);
                        data = responseData;
                        break;
                    }
                }
            } catch (error) {
                console.log(`❌ Failed to fetch with category: ${category}`);
            }
        }
        
        if (!data) {
            console.error('Failed to fetch products with any category variation');
            // Show no products message
            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                productGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                        <i class="fas fa-box-open" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                        <h3 style="color: #666; margin-bottom: 10px;">No Women's Products Found</h3>
                        <p style="color: #999;">Add products via admin panel to see them here!</p>
                    </div>
                `;
            }
            return;
        }
        
        const products = data.data?.products || [];
        
        console.log(`✅ Loaded ${products.length} women's products`);
        
        displayWomensProducts(products);
        
    } catch (error) {
        console.error('❌ Error loading women\'s products:', error);
    }
}

// Display products in the grid
function displayWomensProducts(products) {
    console.log('🎯 displayWomensProducts called with:', products.length, 'products');
    
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
        // Handle image URL with proper validation and debugging
        let imageUrl = 'https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=No+Image';
        
        console.log(`🔍 Product ${product.name} image data:`, {
            images: product.images,
            imageUrls: product.imageUrls,
            firstImage: product.images?.[0]
        });
        
        if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            if (typeof firstImage === 'string' && firstImage !== 'has_images' && firstImage !== '') {
                // Handle different path formats
                if (firstImage.startsWith('http')) {
                    imageUrl = firstImage; // Full URL
                } else if (firstImage.startsWith('uploads/')) {
                    imageUrl = '/' + firstImage; // Relative path from root
                } else if (firstImage.startsWith('/uploads/')) {
                    imageUrl = firstImage; // Already has leading slash
                } else {
                    imageUrl = '/uploads/products/' + firstImage; // Just filename
                }
            } else if (firstImage && firstImage.url && firstImage.url !== 'has_images' && firstImage.url !== '') {
                const imgUrl = firstImage.url;
                if (imgUrl.startsWith('http')) {
                    imageUrl = imgUrl; // Full URL
                } else if (imgUrl.startsWith('uploads/')) {
                    imageUrl = '/' + imgUrl; // Relative path from root
                } else if (imgUrl.startsWith('/uploads/')) {
                    imageUrl = imgUrl; // Already has leading slash
                } else {
                    imageUrl = '/uploads/products/' + imgUrl; // Just filename
                }
            }
        } else if (product.imageUrls && product.imageUrls.length > 0) {
            const firstUrl = product.imageUrls[0];
            if (firstUrl && firstUrl !== 'has_images' && firstUrl !== '') {
                if (firstUrl.startsWith('http')) {
                    imageUrl = firstUrl; // Full URL
                } else if (firstUrl.startsWith('uploads/')) {
                    imageUrl = '/' + firstUrl; // Relative path from root
                } else if (firstUrl.startsWith('/uploads/')) {
                    imageUrl = firstUrl; // Already has leading slash
                } else {
                    imageUrl = '/uploads/products/' + firstUrl; // Just filename
                }
            }
        }
        
        // Final check: Skip broken "has_images" placeholder or empty URLs
        if (imageUrl === 'has_images' || imageUrl === '/has_images' || imageUrl === '' || imageUrl === '/') {
            imageUrl = 'https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=No+Image';
        }
        
        console.log(`🖼️ Final Women's Image URL for ${product.name}:`, imageUrl);
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
                    <img src="${imageUrl}" 
                         class="product-image" 
                         alt="${product.name}"
                         onerror="this.src='https://via.placeholder.com/400x500/FF69B4/FFFFFF?text=No+Image'">
                    ${outOfStockBadge}
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
    console.log('📄 DOM loaded, loading women\'s products...');
    loadWomensProducts();
});
