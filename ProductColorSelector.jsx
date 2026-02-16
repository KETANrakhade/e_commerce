import React, { useState, useEffect, useCallback } from 'react';
import './ProductColorSelector.css';

/**
 * ProductColorSelector - Myntra-style color selection component
 * 
 * @param {Object} productData - Complete product data with color variants
 * @param {string} defaultColor - Default color key to select
 * @param {Function} onColorChange - Callback when color is selected
 * @param {Function} onImageChange - Callback when image is selected
 * @param {string} className - Additional CSS classes
 */
const ProductColorSelector = ({
    productData,
    defaultColor,
    onColorChange,
    onImageChange,
    className = ''
}) => {
    const [currentColor, setCurrentColor] = useState(defaultColor || Object.keys(productData.colors)[0]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Get current color data
    const currentColorData = productData.colors[currentColor];
    const images = currentColorData?.images || [];

    // Handle color selection
    const handleColorSelect = useCallback(async (colorKey) => {
        if (colorKey === currentColor) return;

        setLoading(true);
        setImageLoaded(false);

        // Simulate loading delay for smooth UX
        await new Promise(resolve => setTimeout(resolve, 200));

        setCurrentColor(colorKey);
        setCurrentImageIndex(0);
        
        // Call parent callback
        if (onColorChange) {
            onColorChange(colorKey, productData.colors[colorKey]);
        }

        setLoading(false);
    }, [currentColor, onColorChange, productData.colors]);

    // Handle image selection
    const handleImageSelect = useCallback((imageIndex) => {
        if (imageIndex === currentImageIndex) return;

        setCurrentImageIndex(imageIndex);
        
        if (onImageChange) {
            onImageChange(imageIndex, images[imageIndex]);
        }
    }, [currentImageIndex, images, onImageChange]);

    // Navigation functions
    const previousImage = useCallback(() => {
        const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
        handleImageSelect(newIndex);
    }, [currentImageIndex, images.length, handleImageSelect]);

    const nextImage = useCallback(() => {
        const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
        handleImageSelect(newIndex);
    }, [currentImageIndex, images.length, handleImageSelect]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    previousImage();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextImage();
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [previousImage, nextImage]);

    // Preload images for better performance
    useEffect(() => {
        const preloadImages = (imageUrls) => {
            imageUrls.forEach(url => {
                const img = new Image();
                img.src = url;
            });
        };

        // Preload current color images
        if (images.length > 0) {
            preloadImages(images);
        }

        // Preload other color thumbnails
        Object.values(productData.colors).forEach(color => {
            if (color.thumbnail) {
                const img = new Image();
                img.src = color.thumbnail;
            }
        });
    }, [images, productData.colors]);

    // Touch/swipe handling
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextImage();
        } else if (isRightSwipe) {
            previousImage();
        }
    };

    return (
        <div className={`product-color-selector ${className}`}>
            {/* Main Image Gallery */}
            <div className="product-gallery">
                <div className="main-image-container">
                    <img
                        src={images[currentImageIndex]}
                        alt={`${productData.title} - ${currentColorData?.name}`}
                        className={`main-image ${loading ? 'loading' : ''} ${imageLoaded ? 'loaded' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />
                    
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <div className="image-navigation">
                            <button 
                                className="nav-btn prev-btn" 
                                onClick={previousImage}
                                aria-label="Previous image"
                            >
                                ‹
                            </button>
                            <button 
                                className="nav-btn next-btn" 
                                onClick={nextImage}
                                aria-label="Next image"
                            >
                                ›
                            </button>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
                        </div>
                    )}
                </div>

                {/* Image Thumbnails */}
                {images.length > 1 && (
                    <div className="image-thumbnails">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className={`image-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={() => handleImageSelect(index)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleImageSelect(index);
                                    }
                                }}
                                aria-label={`View image ${index + 1}`}
                            >
                                <img src={image} alt={`Product view ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Color Selection */}
            <div className="color-selection-section">
                <h3 className="section-title">
                    Select Color: <span className="selected-color-name">{currentColorData?.name}</span>
                </h3>
                
                <div className="color-thumbnails">
                    {Object.entries(productData.colors).map(([colorKey, colorData]) => (
                        <ColorThumbnail
                            key={colorKey}
                            colorKey={colorKey}
                            colorData={colorData}
                            isActive={colorKey === currentColor}
                            onClick={() => handleColorSelect(colorKey)}
                            disabled={loading}
                        />
                    ))}
                </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
                <div className="info-item">
                    <span className="info-label">SKU:</span>
                    <span className="info-value">{currentColorData?.sku}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">Availability:</span>
                    <span className={`info-value availability ${currentColorData?.availability}`}>
                        {getAvailabilityText(currentColorData?.availability)}
                    </span>
                </div>
                {currentColorData?.stockCount && (
                    <div className="info-item">
                        <span className="info-label">Stock:</span>
                        <span className="info-value">{currentColorData.stockCount} units</span>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * ColorThumbnail - Individual color selection thumbnail
 */
const ColorThumbnail = ({ colorKey, colorData, isActive, onClick, disabled }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div
            className={`color-thumbnail ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
            onClick={disabled ? undefined : onClick}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onClick();
                }
            }}
            aria-label={`Select ${colorData.name} color`}
            aria-pressed={isActive}
            data-color={colorKey}
        >
            {!imageError ? (
                <img
                    src={colorData.thumbnail}
                    alt={colorData.name}
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="color-placeholder" style={{ backgroundColor: colorData.hexCode || '#ccc' }}>
                    {colorData.name.charAt(0)}
                </div>
            )}
            
            <div className="color-name">{colorData.name}</div>
            
            {/* Availability indicator */}
            {colorData.availability === 'out-of-stock' && (
                <div className="availability-indicator out-of-stock">
                    Out of Stock
                </div>
            )}
            {colorData.availability === 'low-stock' && (
                <div className="availability-indicator low-stock">
                    Few Left
                </div>
            )}
        </div>
    );
};

/**
 * Utility function to get availability text
 */
const getAvailabilityText = (availability) => {
    switch (availability) {
        case 'in-stock':
            return 'In Stock';
        case 'low-stock':
            return 'Only Few Left';
        case 'out-of-stock':
            return 'Out of Stock';
        default:
            return 'Check Availability';
    }
};

/**
 * Hook for managing product color selection state
 */
export const useProductColorSelection = (productData, defaultColor) => {
    const [selectedColor, setSelectedColor] = useState(defaultColor || Object.keys(productData.colors)[0]);
    const [selectedImage, setSelectedImage] = useState(0);

    const selectColor = useCallback((colorKey) => {
        setSelectedColor(colorKey);
        setSelectedImage(0); // Reset to first image when color changes
    }, []);

    const selectImage = useCallback((imageIndex) => {
        setSelectedImage(imageIndex);
    }, []);

    return {
        selectedColor,
        selectedImage,
        selectColor,
        selectImage,
        currentColorData: productData.colors[selectedColor],
        currentImages: productData.colors[selectedColor]?.images || []
    };
};

export default ProductColorSelector;