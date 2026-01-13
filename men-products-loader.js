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

        const apiUrl = `${window.API_BASE_URL}/products/category/men?page=${page}&limit=12`;
        console.log('� Fetchning from:', apiUrl);
        
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
                    <h3 style="color: #666; margin-bottom: 10px;">No Men's Products Found</h3>
                    <p style="color: #999;">Add products via admin panel to see them here!</p>
                </div>
            `;
            hidePagination();
            return;
        }
        
        displayMensProducts(products);
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
        
        // Handle image URL - improved logic with better debugging
        let imageUrl = 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
        
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
            imageUrl = 'https://via.placeholder.com/400x500/65AAC3/FFFFFF?text=No+Image';
        }
        
        console.log(`🖼️ Final Image URL for ${product.name}:`, imageUrl);
        
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

// Load products when page loads - SINGLE EVENT LISTENER
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
        loadMensProducts(1, 'all');
    }, 500);
});

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

// Update filter functionality to work with pagination
function applyFilter(filterValue) {
    console.log(`🔍 Applying filter: ${filterValue}`);
    currentFilter = filterValue;
    loadMensProducts(1, filterValue); // Reset to page 1 when filtering
}
