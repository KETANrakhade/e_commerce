// Men's Products Dynamic Loader
console.log('🔵 Men\'s products loader initialized');

// Load men's products from API
async function loadMensProducts() {
    try {
        console.log('📦 Fetching men\'s products...');
        
        const response = await fetch('http://localhost:5001/api/products/category/men-s-fashion', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('Failed to fetch products:', response.status);
            return;
        }
        
        const data = await response.json();
        const products = data.data?.products || [];
        
        console.log(`✅ Loaded ${products.length} men's products`);
        
        displayMensProducts(products);
        
    } catch (error) {
        console.error('❌ Error loading men\'s products:', error);
    }
}

// Display products in the grid
function displayMensProducts(products) {
    const productGrid = document.getElementById('productGrid');
    
    if (!productGrid) {
        console.error('❌ Product grid not found');
        return;
    }
    
    // Clear existing hardcoded products
    productGrid.innerHTML = '';
    
    if (products.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-box-open" style="font-size: 64px; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666; margin-bottom: 10px;">No Men's Products Found</h3>
                <p style="color: #999;">Add products via Postman to see them here!</p>
            </div>
        `;
        return;
    }
    
    // Create product cards
    products.forEach((product, index) => {
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
        
        // Map common product name patterns to filter categories
        const productNameLower = (product.name || '').toLowerCase();
        const subcategoryNameLower = (product.subcategory?.name || '').toLowerCase();
        const subcategorySlugLower = (product.subcategory?.slug || '').toLowerCase();
        
        // Check subcategory first, then product name
        if (subcategoryNameLower.includes('shirt') && !subcategoryNameLower.includes('t-shirt') && !subcategoryNameLower.includes('tshirt')) {
            categoryFilter = 'shirts';
        } else if (subcategoryNameLower.includes('t-shirt') || subcategoryNameLower.includes('tshirt') || subcategoryNameLower.includes('tee')) {
            categoryFilter = 't-shirts';
        } else if (subcategoryNameLower.includes('jacket')) {
            categoryFilter = 'jackets';
        } else if (subcategoryNameLower.includes('jean')) {
            categoryFilter = 'jeans';
        } else if (subcategoryNameLower.includes('accessor')) {
            categoryFilter = 'accessories';
        } else if (subcategorySlugLower === 'shirts' || subcategorySlugLower === 'shirt') {
            categoryFilter = 'shirts';
        } else if (subcategorySlugLower === 't-shirts' || subcategorySlugLower === 't-shirts' || subcategorySlugLower === 'tshirts') {
            categoryFilter = 't-shirts';
        } else if (subcategorySlugLower === 'jackets' || subcategorySlugLower === 'jacket') {
            categoryFilter = 'jackets';
        } else if (subcategorySlugLower === 'jeans' || subcategorySlugLower === 'jean') {
            categoryFilter = 'jeans';
        } else if (subcategorySlugLower === 'accessories' || subcategorySlugLower === 'accessory') {
            categoryFilter = 'accessories';
        } else if (productNameLower.includes('shirt') && !productNameLower.includes('t-shirt') && !productNameLower.includes('tshirt')) {
            categoryFilter = 'shirts';
        } else if (productNameLower.includes('t-shirt') || productNameLower.includes('tshirt') || productNameLower.includes('tee')) {
            categoryFilter = 't-shirts';
        } else if (productNameLower.includes('jacket')) {
            categoryFilter = 'jackets';
        } else if (productNameLower.includes('jean')) {
            categoryFilter = 'jeans';
        } else if (productNameLower.includes('accessor')) {
            categoryFilter = 'accessories';
        }
        
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
        
        productGrid.innerHTML += productCard;
    });
    
    console.log(`✅ Displayed ${products.length} products`);
    
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
