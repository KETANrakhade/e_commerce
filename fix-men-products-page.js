// Direct fix for men-products page
console.log('🔧 Direct fix script loaded');

// Replace the existing product loader with a working version
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded - starting direct fix');
    
    // Wait for other scripts to load
    setTimeout(async function() {
        console.log('⏰ Timeout reached - executing fix');
        
        const productGrid = document.getElementById('productGrid');
        if (!productGrid) {
            console.error('❌ Product grid not found');
            return;
        }
        
        console.log('✅ Product grid found');
        
        // Show loading
        productGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <div style="width: 50px; height: 50px; border: 3px solid #f3f3f3; border-top: 3px solid #65AAC3; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="color: #999;">Loading products...</p>
            </div>
        `;
        
        try {
            const API_URL = 'http://localhost:5001/api/products/category/men';
            console.log('📡 Fetching from:', API_URL);
            
            const response = await fetch(API_URL);
            console.log('📊 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Response data:', data);
            
            if (!data.success || !data.data || !data.data.products) {
                throw new Error('Invalid response format');
            }
            
            const products = data.data.products;
            console.log(`✅ Got ${products.length} products`);
            
            if (products.length === 0) {
                productGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                        <h3 style="color: #666;">No products found</h3>
                        <p style="color: #999;">Add products via admin panel</p>
                    </div>
                `;
                return;
            }
            
            // Create product cards
            let html = '';
            products.forEach(product => {
                let imageUrl = 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
                
                if (product.images && product.images.length > 0) {
                    const img = product.images[0];
                    if (typeof img === 'string' && img !== 'has_images' && img !== '') {
                        imageUrl = img;
                    } else if (img && img.url && img.url !== 'has_images' && img.url !== '') {
                        imageUrl = img.url;
                    }
                } else if (product.imageUrls && product.imageUrls.length > 0 && product.imageUrls[0] !== 'has_images') {
                    imageUrl = product.imageUrls[0];
                }
                
                const price = product.price ? `₹${product.price.toLocaleString()}` : 'Price N/A';
                
                html += `
                    <div class="product-card" onclick="window.location.href='product.html?id=${product._id}'">
                        <div class="product-image-container">
                            <img src="${imageUrl}" 
                                 class="product-image" 
                                 alt="${product.name}"
                                 onerror="this.src='https://via.placeholder.com/400x500/ff6b6b/ffffff?text=Image+Error'">
                            <div class="product-overlay">
                                <div class="overlay-content">
                                    <button class="quick-view-btn">Quick View</button>
                                </div>
                            </div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <div class="product-price">${price}</div>
                            <div class="product-rating">
                                <i class="fas fa-star star"></i>
                                <i class="fas fa-star star"></i>
                                <i class="fas fa-star star"></i>
                                <i class="fas fa-star star"></i>
                                <i class="fas fa-star star"></i>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            productGrid.innerHTML = html;
            console.log(`✅ Successfully displayed ${products.length} products`);
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <h3 style="color: #ff6b6b;">Error Loading Products</h3>
                    <p style="color: #999;">${error.message}</p>
                    <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    }, 1000); // Wait 1 second for everything to load
});

// Add loading animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);