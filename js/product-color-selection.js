// Product Color Selection JavaScript - Myntra Style Implementation

// Sample Product Data Structure
const productDatabase = {
    'men-tshirt': {
        id: 'men-tshirt-001',
        title: 'Men\'s Premium Cotton T-Shirt',
        brand: 'Pyramid Fashion',
        basePrice: 1299,
        originalPrice: 1999,
        discount: 35,
        rating: 4.2,
        ratingCount: 1247,
        material: 'Premium Cotton',
        defaultColor: 'black',
        colors: {
            black: {
                name: 'Jet Black',
                sku: 'TSH-BLK-001',
                availability: 'in-stock',
                images: [
                    'img/men/Loose Fit Printed T-shirt front.jpg',
                    'img/men/Loose Fit Printed T-shirt 1.jpg',
                    'img/men/Loose Fit Printed T-shirt 2.jpg',
                    'img/men/Loose Fit Printed T-shirt 3.jpg'
                ],
                thumbnail: 'img/men/Loose Fit Printed T-shirt front.jpg'
            },
            navy: {
                name: 'Navy Blue',
                sku: 'TSH-NVY-001',
                availability: 'in-stock',
                images: [
                    'img/men/Regular Fit Polo t-shirt front.jpg',
                    'img/men/Regular Fit Polo t-shirt 1.jpg',
                    'img/men/Regular Fit Polo t-shirt 2.jpg',
                    'img/men/Regular Fit Polo t-shirt.jpg'
                ],
                thumbnail: 'img/men/Regular Fit Polo t-shirt front.jpg'
            },
            white: {
                name: 'Pure White',
                sku: 'TSH-WHT-001',
                availability: 'in-stock',
                images: [
                    'img/men/Muscle Fit Sports T-shirt with DryMove main.jpg',
                    'img/men/Muscle Fit Sports T-shirt with DryMove 1.jpg',
                    'img/men/Muscle Fit Sports T-shirt with DryMove 2.jpg',
                    'img/men/Muscle Fit Sports T-shirt with DryMove 3.jpg'
                ],
                thumbnail: 'img/men/Muscle Fit Sports T-shirt with DryMove main.jpg'
            },
            gray: {
                name: 'Heather Gray',
                sku: 'TSH-GRY-001',
                availability: 'low-stock',
                images: [
                    'img/men/Loose Fit Sweatshirt.jpg',
                    'img/men/Loose Fit Sweatshirt 1.jpg',
                    'img/men/Loose Fit Sweatshirt 3.jpg',
                    'img/men/Loose Fit Sweatshirt 4.jpg'
                ],
                thumbnail: 'img/men/Loose Fit Sweatshirt.jpg'
            },
            green: {
                name: 'Forest Green',
                sku: 'TSH-GRN-001',
                availability: 'out-of-stock',
                images: [
                    'img/men/Regular Fit Cotton resort shirt.jpg',
                    'img/men/Regular Fit Cotton resort shirt 2.jpg',
                    'img/men/Regular Fit Cotton resort shirt 3.jpg',
                    'img/men/Regular Fit Cotton resort shirt 4.jpg'
                ],
                thumbnail: 'img/men/Regular Fit Cotton resort shirt.jpg'
            }
        }
    },
    'women-dress': {
        id: 'women-dress-001',
        title: 'Women\'s Elegant Midi Dress',
        brand: 'Pyramid Fashion',
        basePrice: 2499,
        originalPrice: 3999,
        discount: 38,
        rating: 4.5,
        ratingCount: 892,
        material: 'Polyester Blend',
        defaultColor: 'red',
        colors: {
            red: {
                name: 'Crimson Red',
                sku: 'DRS-RED-001',
                availability: 'in-stock',
                images: [
                    'img/women/342baa60b5956f7ebaac03cf60849a43f29c9d9d.avif',
                    'img/women/4004fde593c535a2993db9f3a3dd08f967c6fb43.avif',
                    'img/women/53b7491ba276a85a154c11d4cb42c9f2287051a2.avif',
                    'img/women/558b199791f64a1f84b6b16e36b85d9a038caeda.avif'
                ],
                thumbnail: 'img/women/342baa60b5956f7ebaac03cf60849a43f29c9d9d.avif'
            },
            blue: {
                name: 'Royal Blue',
                sku: 'DRS-BLU-001',
                availability: 'in-stock',
                images: [
                    'img/women/564e21dd773b9171cc876378d16cf078d725a3e6.avif',
                    'img/women/57704613766cc5a975cab7483b7320d16ba7d203.avif',
                    'img/women/62db1ac7303f82a54c7352767ad4e935ba555fb3.avif',
                    'img/women/63c673e89ddab4e70a84c31db78c617086ccc787.avif'
                ],
                thumbnail: 'img/women/564e21dd773b9171cc876378d16cf078d725a3e6.avif'
            },
            black: {
                name: 'Classic Black',
                sku: 'DRS-BLK-001',
                availability: 'in-stock',
                images: [
                    'img/women/89c6a143ec001272f58f5a8f26c2ac1dd6ccec88.avif',
                    'img/women/8f4672d898a135f5de7c52981739edee204bf966.avif',
                    'img/women/a2e1a27676b7c0c9ee159a681a32a3479c3ab568.avif',
                    'img/women/acf17b75c46881731cab64c2e392cfffbbeb3ab3.avif'
                ],
                thumbnail: 'img/women/89c6a143ec001272f58f5a8f26c2ac1dd6ccec88.avif'
            },
            pink: {
                name: 'Blush Pink',
                sku: 'DRS-PNK-001',
                availability: 'in-stock',
                images: [
                    'img/women/c2f847228a423c7988c998a7b3cb2b1a90b11a0e.avif',
                    'img/women/c7451998c3d555fcc0eda7bb3317d7a9f4b894cc.avif',
                    'img/women/d24aa7660be51f38f81d778ed07e53e913fe22af.avif',
                    'img/women/d9bb6a092a8f720aa5b2015eaf5730bf4b256c38.avif'
                ],
                thumbnail: 'img/women/c2f847228a423c7988c998a7b3cb2b1a90b11a0e.avif'
            }
        }
    },
    'men-jeans': {
        id: 'men-jeans-001',
        title: 'Men\'s Slim Fit Denim Jeans',
        brand: 'Pyramid Fashion',
        basePrice: 1899,
        originalPrice: 2999,
        discount: 37,
        rating: 4.3,
        ratingCount: 2156,
        material: 'Denim Cotton',
        defaultColor: 'blue',
        colors: {
            blue: {
                name: 'Classic Blue',
                sku: 'JNS-BLU-001',
                availability: 'in-stock',
                images: [
                    'img/Regular blue Jeans  front.jpg',
                    'img/Regular blue Jeans 1.jpg',
                    'img/Regular blue Jeans  2.jpg',
                    'img/Regular blue Jeans  3.jpg'
                ],
                thumbnail: 'img/Regular blue Jeans  front.jpg'
            },
            black: {
                name: 'Jet Black',
                sku: 'JNS-BLK-001',
                availability: 'in-stock',
                images: [
                    'img/peter england Regular Jeans front.jpg',
                    'img/peter england Regular Jeans 1.jpg',
                    'img/peter england Regular Jeans 2.jpg',
                    'img/peter england Regular Jeans 3.jpg'
                ],
                thumbnail: 'img/peter england Regular Jeans front.jpg'
            },
            gray: {
                name: 'Stone Gray',
                sku: 'JNS-GRY-001',
                availability: 'in-stock',
                images: [
                    'img/men/Relaxed Fit Cotton cargo trousers.jpg',
                    'img/men/Relaxed Fit Cotton cargo trousers 1.jpg',
                    'img/men/Relaxed Fit Cotton cargo trousers front.jpg'
                ],
                thumbnail: 'img/men/Relaxed Fit Cotton cargo trousers.jpg'
            }
        }
    }
};

// Global State
let currentProduct = null;
let currentColorKey = null;
let currentImageIndex = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load default product
    loadProduct('men-tshirt');
    
    // Add size selection event listeners
    initializeSizeSelection();
});

// Load product data and initialize UI
function loadProduct(productKey) {
    if (!productDatabase[productKey]) {
        console.error('Product not found:', productKey);
        return;
    }
    
    currentProduct = productDatabase[productKey];
    currentColorKey = currentProduct.defaultColor;
    currentImageIndex = 0;
    
    // Update product details
    updateProductDetails();
    
    // Render color thumbnails
    renderColorThumbnails();
    
    // Update main image and thumbnails
    updateProductImages();
    
    // Add fade-in animation
    document.querySelector('.product-page').classList.add('fade-in');
}

// Update product details in the UI
function updateProductDetails() {
    const product = currentProduct;
    const currentColor = product.colors[currentColorKey];
    
    // Update basic product info
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productPrice').textContent = `₹${product.basePrice}`;
    document.getElementById('originalPrice').textContent = `₹${product.originalPrice}`;
    document.getElementById('discount').textContent = `${product.discount}% OFF`;
    
    // Update color-specific details
    document.getElementById('selectedColorName').textContent = currentColor.name;
    document.getElementById('productSku').textContent = currentColor.sku;
    document.getElementById('productMaterial').textContent = product.material;
    
    // Update availability
    const availabilityElement = document.getElementById('productAvailability');
    const availability = currentColor.availability;
    
    availabilityElement.className = `info-value availability ${availability}`;
    
    switch(availability) {
        case 'in-stock':
            availabilityElement.textContent = 'In Stock';
            break;
        case 'low-stock':
            availabilityElement.textContent = 'Only Few Left';
            break;
        case 'out-of-stock':
            availabilityElement.textContent = 'Out of Stock';
            break;
        default:
            availabilityElement.textContent = 'Check Availability';
    }
}

// Render color selection thumbnails
function renderColorThumbnails() {
    const colorThumbnailsContainer = document.getElementById('colorThumbnails');
    colorThumbnailsContainer.innerHTML = '';
    
    Object.keys(currentProduct.colors).forEach(colorKey => {
        const colorData = currentProduct.colors[colorKey];
        
        const colorThumbnail = document.createElement('div');
        colorThumbnail.className = `color-thumbnail ${colorKey === currentColorKey ? 'active' : ''}`;
        colorThumbnail.setAttribute('data-color', colorKey);
        colorThumbnail.onclick = () => selectColor(colorKey);
        
        const img = document.createElement('img');
        img.src = colorData.thumbnail;
        img.alt = colorData.name;
        img.onerror = () => {
            img.src = 'img/placeholder.jpg'; // Fallback image
        };
        
        const colorName = document.createElement('div');
        colorName.className = 'color-name';
        colorName.textContent = colorData.name;
        
        colorThumbnail.appendChild(img);
        colorThumbnail.appendChild(colorName);
        colorThumbnailsContainer.appendChild(colorThumbnail);
    });
}

// Select a color variant
function selectColor(colorKey) {
    if (colorKey === currentColorKey) return;
    
    // Add loading state
    document.querySelector('.product-gallery').classList.add('loading');
    
    setTimeout(() => {
        currentColorKey = colorKey;
        currentImageIndex = 0;
        
        // Update active color thumbnail
        document.querySelectorAll('.color-thumbnail').forEach(thumb => {
            thumb.classList.remove('active');
        });
        document.querySelector(`[data-color="${colorKey}"]`).classList.add('active');
        
        // Update product details
        updateProductDetails();
        
        // Update images
        updateProductImages();
        
        // Remove loading state
        document.querySelector('.product-gallery').classList.remove('loading');
        
        // Add selection animation
        const selectedThumbnail = document.querySelector(`[data-color="${colorKey}"]`);
        selectedThumbnail.style.transform = 'scale(1.1)';
        setTimeout(() => {
            selectedThumbnail.style.transform = '';
        }, 200);
        
    }, 300); // Simulate loading time
}

// Update product images for selected color
function updateProductImages() {
    const currentColor = currentProduct.colors[currentColorKey];
    const images = currentColor.images;
    
    // Update main image
    const mainImage = document.getElementById('mainProductImage');
    mainImage.src = images[currentImageIndex];
    mainImage.alt = `${currentProduct.title} - ${currentColor.name}`;
    
    // Update image thumbnails
    renderImageThumbnails(images);
}

// Render image thumbnails for current color
function renderImageThumbnails(images) {
    const thumbnailContainer = document.getElementById('imageThumbnails');
    thumbnailContainer.innerHTML = '';
    
    images.forEach((imageSrc, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = `image-thumbnail ${index === currentImageIndex ? 'active' : ''}`;
        thumbnail.onclick = () => selectImage(index);
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `Product image ${index + 1}`;
        img.onerror = () => {
            img.src = 'img/placeholder.jpg'; // Fallback image
        };
        
        thumbnail.appendChild(img);
        thumbnailContainer.appendChild(thumbnail);
    });
}

// Select a specific image
function selectImage(index) {
    const images = currentProduct.colors[currentColorKey].images;
    if (index < 0 || index >= images.length) return;
    
    currentImageIndex = index;
    
    // Update main image
    const mainImage = document.getElementById('mainProductImage');
    mainImage.style.opacity = '0.7';
    
    setTimeout(() => {
        mainImage.src = images[currentImageIndex];
        mainImage.style.opacity = '1';
    }, 150);
    
    // Update active thumbnail
    document.querySelectorAll('.image-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    document.querySelectorAll('.image-thumbnail')[index].classList.add('active');
}

// Navigate to previous image
function previousImage() {
    const images = currentProduct.colors[currentColorKey].images;
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    selectImage(newIndex);
}

// Navigate to next image
function nextImage() {
    const images = currentProduct.colors[currentColorKey].images;
    const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    selectImage(newIndex);
}

// Initialize size selection functionality
function initializeSizeSelection() {
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all size buttons
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Add selection animation
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
}

// Add to bag functionality
document.addEventListener('DOMContentLoaded', function() {
    const addToBagBtn = document.querySelector('.add-to-bag');
    const addToWishlistBtn = document.querySelector('.add-to-wishlist');
    
    addToBagBtn.addEventListener('click', function() {
        const selectedSize = document.querySelector('.size-btn.active')?.getAttribute('data-size');
        
        if (!selectedSize) {
            alert('Please select a size');
            return;
        }
        
        const currentColor = currentProduct.colors[currentColorKey];
        
        if (currentColor.availability === 'out-of-stock') {
            alert('This color variant is currently out of stock');
            return;
        }
        
        // Simulate add to bag
        this.innerHTML = '<span class="btn-icon">✓</span> ADDED TO BAG';
        this.style.background = '#03a685';
        
        setTimeout(() => {
            this.innerHTML = '<span class="btn-icon">🛍️</span> ADD TO BAG';
            this.style.background = '#ff3f6c';
        }, 2000);
        
        console.log('Added to bag:', {
            product: currentProduct.title,
            color: currentColor.name,
            size: selectedSize,
            sku: currentColor.sku
        });
    });
    
    addToWishlistBtn.addEventListener('click', function() {
        // Toggle wishlist state
        const isWishlisted = this.innerHTML.includes('♥');
        
        if (isWishlisted) {
            this.innerHTML = '<span class="btn-icon">♡</span> WISHLIST';
            this.style.color = '#282c3f';
        } else {
            this.innerHTML = '<span class="btn-icon">♥</span> WISHLISTED';
            this.style.color = '#ff3f6c';
        }
        
        console.log('Wishlist toggled:', {
            product: currentProduct.title,
            color: currentProduct.colors[currentColorKey].name,
            wishlisted: !isWishlisted
        });
    });
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        previousImage();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.getElementById('mainProductImage').addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.getElementById('mainProductImage').addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextImage(); // Swipe left - next image
        } else {
            previousImage(); // Swipe right - previous image
        }
    }
}

// Utility function to preload images for better performance
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Preload all product images on page load
document.addEventListener('DOMContentLoaded', function() {
    Object.values(productDatabase).forEach(product => {
        Object.values(product.colors).forEach(color => {
            preloadImages(color.images);
        });
    });
});

// Export functions for external use
window.ProductColorSelection = {
    loadProduct,
    selectColor,
    selectImage,
    previousImage,
    nextImage,
    getCurrentProduct: () => currentProduct,
    getCurrentColor: () => currentColorKey,
    getCurrentImage: () => currentImageIndex
};