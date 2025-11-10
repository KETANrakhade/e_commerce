
document.getElementById("viewHome").addEventListener("click", function () {
  window.location.href = "index.html";
});
document.getElementById("userProfile").addEventListener("click", function () {
  window.location.href = "login.html";
});
document.getElementById("viewMen").addEventListener("click", function () {
  window.location.href = "men-product.html";
});
document.getElementById("viewWomen").addEventListener("click", function () {
  window.location.href = "women-product.html";
});
document.getElementById("viewCart").addEventListener("click", function () {
  window.location.href = "cart.html";
});

// Also handle the cart button in enhanced index.html
document.addEventListener('DOMContentLoaded', function() {
  const cartBtn = document.getElementById("viewCart");
  if (cartBtn) {
    cartBtn.addEventListener("click", function () {
      window.location.href = "cart.html";
    });
  }
});
document.getElementById("viewWishlist").addEventListener("click", function () {
  window.location.href = "wishlist.html";
});
document.getElementById("saleBtn").addEventListener("click", function () {
  window.location.href = "discount.html";
});
document.getElementById("discountSale").addEventListener("click", function () {
  window.location.href = "discount.html";
});

// Admin panel navigation
document.addEventListener('DOMContentLoaded', function() {
  const adminPanelBtn = document.getElementById("adminPanel");
  if (adminPanelBtn) {
    adminPanelBtn.addEventListener("click", function () {
      window.location.href = "admin.html";
    });
  }
});



const slider = document.querySelector("#slider");
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

leftBtn.addEventListener("click", () => {
  active = (active - 1 + slides.length) % slides.length;
  updateSlides();
});

rightBtn.addEventListener("click", () => {
  active = (active + 1) % slides.length;
  updateSlides();
});


updateSlides();

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

// Fetch Products function
const fetchProducts = async () => {
  try {
    // Products endpoint doesn't require authentication based on backend routes
    const res = await fetch('http://localhost:5001/api/products', {
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
  fetchProducts();
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
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // Hide admin button when logging out
  hideAdminButton();
  
  window.location.href = 'index.html';
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
      
      // Add logout functionality
      userProfileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Do you want to logout?')) {
          logout();
        }
      });
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
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  saveCart(cart);
  showNotification(`${product.name} added to cart!`, 'success');
}

async function addToWishlist(product) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    showNotification('Please login to add items to wishlist', 'info');
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
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems > 0 ? totalItems : '';
    cartBadge.style.display = totalItems > 0 ? 'inline-block' : 'none';
  }
};

// Wishlist badge update function
const updateWishlistBadge = () => {
  const wishlistBadge = document.querySelector('#viewWishlist .badge');
  if (wishlistBadge) {
    const wishlist = getWishlist();
    const totalItems = wishlist.length;
    wishlistBadge.textContent = totalItems > 0 ? totalItems : '';
    wishlistBadge.style.display = totalItems > 0 ? 'inline-block' : 'none';
  }
};

// Enhanced error handling for API calls
const handleApiError = (error, context = 'API call') => {
  console.error(`${context} error:`, error);
  
  if (error.message.includes('Failed to fetch')) {
    alert('Unable to connect to server. Please check if the backend is running on http://localhost:5001');
  } else if (error.status === 401) {
    alert('Session expired. Please login again.');
    logout();
  } else {
    alert(`${context} failed. Please try again.`);
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