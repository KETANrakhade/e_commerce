// Wait for DOM to be ready before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Navigation event listeners
  const viewHome = document.getElementById("viewHome");
  if (viewHome) {
    viewHome.addEventListener("click", function () {
      window.location.href = "index-backup.html";
    });
  }

  const viewHome2 = document.getElementById("viewHome2");
  if (viewHome2) {
    viewHome2.addEventListener("click", function () {
      window.location.href = "index-backup.html";
    });
  }

  const userProfile = document.getElementById("userProfile");
  if (userProfile) {
    userProfile.addEventListener("click", function () {
      window.location.href = "login.html";
    });
  }

  const viewMen = document.getElementById("viewMen");
  if (viewMen) {
    viewMen.addEventListener("click", function () {
      window.location.href = "men-product.html";
    });
  }

  const viewWomen = document.getElementById("viewWomen");
  if (viewWomen) {
    viewWomen.addEventListener("click", function () {
      window.location.href = "women-product.html";
    });
  }

  const viewCart = document.getElementById("viewCart");
  if (viewCart) {
    viewCart.addEventListener("click", function () {
      window.location.href = "cart.html";
    });
  }

  const viewWishlist = document.getElementById("viewWishlist");
  if (viewWishlist) {
    viewWishlist.addEventListener("click", function () {
      window.location.href = "wishlist.html";
    });
  }

  const saleBtn = document.getElementById("saleBtn");
  if (saleBtn) {
    saleBtn.addEventListener("click", function () {
      window.location.href = "discount.html";
    });
  }

  const discountSale = document.getElementById("discountSale");
  if (discountSale) {
    discountSale.addEventListener("click", function () {
      window.location.href = "discount.html";
    });
  }
});

// Admin panel navigation - Opens new pyramid-admin panel
document.addEventListener('DOMContentLoaded', function() {
  const adminPanelBtn = document.getElementById("adminPanel");
  if (adminPanelBtn) {
    adminPanelBtn.addEventListener("click", function () {
      // Open new admin panel (pyramid-admin) instead of old admin.html
      window.location.href = "http://localhost:8000";
    });
  }
});

// Slider functionality - wrapped in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.querySelector("#slider");
  if (!slider) return; // Exit if slider doesn't exist on this page
  
  const slides = slider.querySelectorAll(".slide");
  const leftBtn = slider.querySelector(".arrow.left");
  const rightBtn = slider.querySelector(".arrow.right");

  let active = 2;

  function updateSlides() {
    slides.forEach((slide, index) => {
      slide.className = "slide";
      if (index === active) {
        slide.classList.add("active");
      } else if (index === active - 1) {
        slide.classList.add("left");
      } else if (index === active + 1) {
        slide.classList.add("right");
      }else if (index === active - 2) {
        slide.classList.add("left1");
      } else if (index === active + 2) {
        slide.classList.add("right1");
      }
    });
  }

  if (leftBtn) {
    leftBtn.addEventListener("click", () => {
      active = (active - 1 + slides.length) % slides.length;
      updateSlides();
    });
  }

  if (rightBtn) {
    rightBtn.addEventListener("click", () => {
      active = (active + 1) % slides.length;
      updateSlides();
    });
  }

  updateSlides();
});

window.addEventListener("scroll", () => {
  let heroImg = document.querySelector(".hero-img");
  let heroWrap = document.querySelector(".hero-wrap");

  if (heroImg && heroWrap) {
    let rect = heroWrap.getBoundingClientRect();
    let scrollTop = window.scrollY || window.pageYOffset;


    let offset = (scrollTop - heroWrap.offsetTop) * 0.2;

    heroImg.style.transform = `translate3d(0, ${offset}px, 0)`;
  }
});

// Login function
const login = async (email, password) => {
  const res = await fetch('http://localhost:5001/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
  }
  return data;
};

// Debug function to test API connection
const testApiConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const apiUrl = window.API_BASE_URL || 'http://localhost:5001/api';
    console.log('API URL:', apiUrl);
    
    const response = await fetch(`${apiUrl}/products`);
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', data);
      console.log('Products found:', data.data?.products?.length || 0);
      
      // Test category filtering
      const products = data.data?.products || [];
      const menProducts = products.filter(product => {
        const categoryName = product.category?.name?.toLowerCase() || '';
        const categorySlug = product.category?.slug?.toLowerCase() || '';
        return categoryName === 'men' || categoryName === 'male' || categorySlug === 'men' || categorySlug === 'male';
      });
      
      const womenProducts = products.filter(product => {
        const categoryName = product.category?.name?.toLowerCase() || '';
        const categorySlug = product.category?.slug?.toLowerCase() || '';
        return categoryName === 'women' || categoryName === 'female' || categorySlug === 'women' || categorySlug === 'female';
      });
      
      console.log('🔍 Category breakdown:');
      console.log('  Men products:', menProducts.length);
      console.log('  Women products:', womenProducts.length);
      
      return data;
    } else {
      console.error('API Error:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Connection Error:', error);
    return null;
  }
};

// Fetch Products function
const fetchProducts = async () => {
  try {
    // Products endpoint doesn't require authentication based on backend routes
    const apiUrl = window.API_BASE_URL || 'http://localhost:5001/api';
    const res = await fetch(`${apiUrl}/products`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.log("Error fetching products:", res.status);
      return [];
    }

    const data = await res.json();
    const products = data.data?.products || data.products || data; // Handle both response formats
    console.log('Fetched products:', products);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Fetch products by category
const fetchProductsByCategory = async (category) => {
  try {
    const apiUrl = window.API_BASE_URL || 'http://localhost:5001/api';
    const res = await fetch(`${apiUrl}/products/category/${category}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.log(`Error fetching ${category} products:`, res.status);
      return [];
    }

    const data = await res.json();
    const products = data.data?.products || data.products || data;
    console.log(`Fetched ${category} products:`, products);
    return products;
  } catch (error) {
    console.error(`Error fetching ${category} products:`, error);
    return [];
  }
};

// Display products on homepage
const displayProducts = async () => {
  const products = await fetchProducts();
  const productGrid = document.querySelector('.product-grid');
  
  if (!productGrid) {
    console.log('Product grid not found');
    return;
  }
  
  if (!products || products.length === 0) {
    console.log('No products found - keeping existing static content');
    return; // Keep the existing static content if no products
  }
  
  // Separate products by category
  const menProducts = products.filter(product => {
    const categoryName = product.category?.name?.toLowerCase() || '';
    const categorySlug = product.category?.slug?.toLowerCase() || '';
    const categoryDirect = (product.category || '').toLowerCase();
    
    return categoryName === 'men' || 
           categoryName === 'male' || 
           categorySlug === 'men' || 
           categorySlug === 'male' ||
           categoryDirect === 'men' ||
           categoryDirect === 'male';
  });
  
  const womenProducts = products.filter(product => {
    const categoryName = product.category?.name?.toLowerCase() || '';
    const categorySlug = product.category?.slug?.toLowerCase() || '';
    const categoryDirect = (product.category || '').toLowerCase();
    
    return categoryName === 'women' || 
           categoryName === 'female' || 
           categorySlug === 'women' || 
           categorySlug === 'female' ||
           categoryDirect === 'women' ||
           categoryDirect === 'female';
  });
  
  // Featured products (can be from any category, limit to 8)
  let featuredProducts = products.filter(product => product.featured === true).slice(0, 8);
  
  // If no featured products, show recent products (limit to 8)
  if (featuredProducts.length === 0) {
    featuredProducts = products.slice(0, 8);
    console.log('No featured products found, showing recent products instead');
  }
  
  console.log(`📊 Products breakdown:`, {
    total: products.length,
    men: menProducts.length,
    women: womenProducts.length,
    featured: featuredProducts.length
  });
  
  // Only replace content if we have products to show
  if (featuredProducts.length > 0) {
    // Clear existing hardcoded products
    productGrid.innerHTML = '';
    
    featuredProducts.forEach(product => {
      // Handle image URL with proper validation
      let imageUrl = 'https://via.placeholder.com/300x400/65AAC3/FFFFFF?text=No+Image';
      
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
          imageUrl = 'https://via.placeholder.com/300x400/65AAC3/FFFFFF?text=No+Image';
      }
      
      const price = product.price ? `₹${product.price}` : 'Price not available';
      
      const productHTML = `
        <div class="product-item" onclick="viewProduct('${product._id}')" style="cursor: pointer;">
          <img src="${imageUrl}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x400/65AAC3/FFFFFF?text=No+Image'">
          <div class="product-overlay">
            <div class="product-info">
              <h4>${product.name}</h4>
              <p>${price}</p>
              <div class="product-actions">
                <button class="btn" onclick="event.stopPropagation(); viewProduct('${product._id}')">View Details</button>
                <button class="btn btn-outline-light ms-2" onclick="event.stopPropagation(); addToCartFromHome('${product._id}', '${product.name}', ${product.price}, '${imageUrl}')">
                  <i class="fas fa-shopping-cart"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      productGrid.innerHTML += productHTML;
    });
    
    console.log(`✅ Displayed ${featuredProducts.length} products in Featured Collections`);
  } else {
    console.log('No products to display - keeping static content');
  }
};

// View product details
const viewProduct = (productId) => {
  window.location.href = `product.html?id=${productId}`;
};

// Add to cart from home page
const addToCartFromHome = (productId, name, price, image) => {
  const product = {
    _id: productId,
    id: productId,
    name: name,
    price: price,
    image: image
  };
  addToCart(product);
};

// Product search function
const searchProducts = async (keyword) => {
  try {
    const res = await fetch(`http://localhost:5001/api/products?keyword=${encodeURIComponent(keyword)}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.log("Error searching products:", res.status);
      return [];
    }

    const data = await res.json();
    const products = data.data?.products || data.products || data;
    console.log('Search results:', products);
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// Example usage
// Call this when page loads or button clicks
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  console.log('🔍 Current page:', currentPage);
  
  // Test API connection first
  testApiConnection();
  
  // Load dynamic products on homepage and other pages
  if (currentPage === 'index.html' || currentPage === 'index-backup.html' || currentPage === '') {
    console.log('🏠 Homepage detected - loading dynamic products for Featured Collections');
    
    // Add a small delay to ensure DOM is fully loaded
    setTimeout(() => {
      displayProducts(); // Load products for Featured Collections
    }, 500);
  } else if (currentPage !== 'men-product.html' && currentPage !== 'women-product.html') {
    console.log('📦 Loading dynamic products for page:', currentPage);
    displayProducts(); // Display products on other pages
  } else {
    console.log('👔 Men/Women page detected - products loaded by specific loaders');
  }
});

// Authentication utilities
const isLoggedIn = () => {
  return localStorage.getItem('token') !== null;
};

const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

const logout = () => {
  // Clear all user and admin data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // Clear cart and wishlist data
  localStorage.removeItem('cart_v1');
  localStorage.removeItem('wishlist_v1');
  localStorage.removeItem('cart');
  localStorage.removeItem('wishlist');
  
  console.log('✅ User logged out - all data cleared');
  
  // Hide admin button when logging out
  hideAdminButton();
  
  window.location.href = 'index-backup.html';
};

// Update admin crown icon visibility
const updateAdminButton = () => {
  const adminPanelBtn = document.getElementById("adminPanel");
  
  if (adminPanelBtn) {
    // Check if user is logged in as admin or has admin token
    const adminToken = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    const regularUser = getCurrentUser();
    
    const isAdminUser = (adminToken && adminUser) || (regularUser && regularUser.role === 'admin');
    
    if (isAdminUser) {
      adminPanelBtn.style.display = 'inline-block';
      adminPanelBtn.title = 'Admin Panel';
    } else {
      adminPanelBtn.style.display = 'none';
    }
  }
};

// Global function to show admin button (can be called from other scripts)
window.showAdminButton = () => {
  updateAdminButton();
};

// Global function to hide admin button (can be called from other scripts)
window.hideAdminButton = () => {
  const adminPanelBtn = document.getElementById("adminPanel");
  if (adminPanelBtn) {
    adminPanelBtn.style.display = 'none';
  }
};

// Update navbar based on authentication status
const updateNavbar = () => {
  const userProfileBtn = document.getElementById('userProfile');
  if (userProfileBtn) {
    if (isLoggedIn()) {
      const user = getCurrentUser();
      userProfileBtn.innerHTML = `<i class="fa-solid fa-user"></i>`;
      userProfileBtn.title = `Welcome, ${user.name}`;
      
     
    } else {
      userProfileBtn.innerHTML = `<i class="fa-regular fa-user"></i>`;
      userProfileBtn.title = 'Login';
    }
  }
  
  // Update admin button visibility
  updateAdminButton();
};

// Sample product data for homepage
const sampleProducts = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: 1299,
    image: "img/men/1ae781d7afbcb047a990cbe64771b96c07cb9823.avif",
    category: "Men"
  },
  {
    id: 2,
    name: "Elegant Summer Dress",
    price: 2499,
    image: "img/women/untitled folder/342baa60b5956f7ebaac03cf60849a43f29c9d9d.avif",
    category: "Women"
  },
  {
    id: 3,
    name: "Classic Denim Jacket",
    price: 3999,
    image: "img/men/b88fd74ccbc9dd08a231f81f621dc83cae42a3c1.avif",
    category: "Men"
  }
];

// Cart functionality
const CART_KEY = 'cart_v1';
const WISHLIST_KEY = 'wishlist_v1';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function getWishlist() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}

function saveWishlist(wishlist) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  updateWishlistBadge();
}

function addToCart(product) {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  
  if (!token) {
    showNotification('Please login to add items to cart', 'info');
    // Optionally redirect to login page
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id || item._id === product._id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    // Ensure both _id and id fields are preserved
    const cartItem = { 
      ...product, 
      quantity: 1,
      _id: product._id || product.id,
      id: product.id || product._id
    };
    cart.push(cartItem);
  }
  
  saveCart(cart);
  showNotification(`${product.name} added to cart!`, 'success');
}

async function addToWishlist(product) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    showNotification('Please login to add items to wishlist', 'info');
    // Optionally redirect to login page
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  try {
    const response = await fetch('http://localhost:5001/api/wishlist/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId: product.id })
    });

    const result = await response.json();

    if (response.ok) {
      // Also add to localStorage for immediate UI update
      const wishlist = getWishlist();
      const existingItem = wishlist.find(item => 
        item.id === product.id || item._id === product.id || item.productId === product.id
      );
      
      if (!existingItem) {
        wishlist.push({
          _id: product.id,
          id: product.id,
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.image || product.images?.[0]?.url || product.imageUrls?.[0],
          images: product.images,
          imageUrls: product.imageUrls
        });
        saveWishlist(wishlist);
      }
      
      showNotification(`${product.name} added to wishlist!`, 'success');
      updateWishlistBadge();
    } else {
      throw new Error(result.message || 'Failed to add to wishlist');
    }
  } catch (error) {
    console.error('Wishlist error:', error);
    // Fallback to localStorage
    const wishlist = getWishlist();
    const existingItem = wishlist.find(item => item.id === product.id);
    
    if (!existingItem) {
      wishlist.push(product);
      saveWishlist(wishlist);
      showNotification(`${product.name} added to wishlist!`, 'success');
    } else {
      showNotification(`${product.name} is already in wishlist!`, 'info');
    }
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
    ${message}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Cart badge update function
const updateCartBadge = () => {
  const cartBadge = document.querySelector('#viewCart .badge');
  if (cartBadge) {
    const cart = getCart();
    const totalItems = cart.length; // Count unique products, not total quantity
    cartBadge.textContent = totalItems > 0 ? totalItems : '';
    cartBadge.style.display = totalItems > 0 ? 'inline-block' : 'none';
  }
};

// Wishlist badge update function
const updateWishlistBadge = () => {
  const wishlistBadges = document.querySelectorAll('#viewWishlist .badge, .wishlist-badge');
  const wishlist = getWishlist();
  const totalItems = wishlist.length;
  
  wishlistBadges.forEach(badge => {
    if (badge) {
      badge.textContent = totalItems > 0 ? totalItems : '';
      badge.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
  });
  
  console.log(`💝 Wishlist badge updated: ${totalItems} items`);
};

// Enhanced error handling for API calls
const handleApiError = (error, context = 'API call') => {
  console.error(`${context} error:`, error);
  
  if (error.message.includes('Failed to fetch')) {
    if (typeof showToast === 'function') {
      showToast('Unable to connect to server. Please check if the backend is running on http://localhost:5001', 'error');
    } else {
      console.error('Unable to connect to server. Please check if the backend is running on http://localhost:5001');
    }
  } else if (error.status === 401) {
    if (typeof showToast === 'function') {
      showToast('Session expired. Please login again.', 'warning');
    } else {
      console.warn('Session expired. Please login again.');
    }
    logout();
  } else {
    if (typeof showToast === 'function') {
      showToast(`${context} failed. Please try again.`, 'error');
    } else {
      console.error(`${context} failed. Please try again.`);
    }
  }
};

// Initialize navbar on page load
document.addEventListener('DOMContentLoaded', function() {
  updateNavbar();
  updateCartBadge();
  updateWishlistBadge();
  
  // Add click handlers to product buttons
  document.querySelectorAll('.product-item').forEach((item, index) => {
    const button = item.querySelector('.btn');
    if (button && sampleProducts[index]) {
      button.addEventListener('click', () => {
        addToCart(sampleProducts[index]);
      });
    }
  });
  
  // Listen for storage changes to update admin button visibility
  window.addEventListener('storage', function(e) {
    if (e.key === 'adminToken' || e.key === 'adminUser' || e.key === 'user') {
      updateAdminButton();
    }
  });
});