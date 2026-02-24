const mongoose = require('mongoose');

// Image schema for detailed image information
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true }, // Cloudinary URL
  publicId: { type: String, required: true }, // Cloudinary public ID for deletion
  alt: { type: String, default: '' }, // Alt text for accessibility
  isPrimary: { type: Boolean, default: false }, // Primary product image
  width: Number,
  height: Number,
  format: String, // jpg, png, webp, etc.
  size: Number // File size in bytes
}, { _id: false });

// Color variant schema for managing different color options
const colorVariantSchema = new mongoose.Schema({
  colorName: { type: String, required: true }, // e.g., "Jet Black", "Navy Blue"
  colorCode: { type: String }, // Hex color code for display (optional)
  sku: { type: String, required: true }, // Unique SKU for this color variant
  images: [imageSchema], // Images specific to this color variant
  stock: { type: Number, default: 0 }, // Stock for this specific color
  priceModifier: { type: Number, default: 0 }, // Price difference from base price
  isActive: { type: Boolean, default: true }, // Whether this color is available
  sortOrder: { type: Number, default: 0 } // For ordering colors in frontend
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { 
    type: String, 
    unique: true,
    default: function() {
      return this.name ? this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : '';
    }
  },
  description: String,
  price: { type: Number, required: true }, // Base price - store INR/INR paise conversion in frontend/backend
  
  // Discount system
  discount: {
    isOnSale: { type: Boolean, default: false }, // Whether product is on sale
    percentage: { type: Number, default: 0, min: 0, max: 100 }, // Discount percentage (0-100)
    salePrice: { type: Number, default: 0 }, // Calculated sale price
    startDate: { type: Date }, // Sale start date (optional)
    endDate: { type: Date }, // Sale end date (optional)
    saleLabel: { type: String, default: '' } // Custom sale label like "MEGA SALE", "CLEARANCE", etc.
  },
  
  // Enhanced image schema (for backward compatibility)
  images: [imageSchema], // Detailed image objects
  
  // Backward compatibility - simple image URLs array
  imageUrls: [String], // Simple URLs for backward compatibility
  
  // NEW: Color variants system
  colorVariants: [colorVariantSchema], // Array of color variants
  hasColorVariants: { type: Boolean, default: false }, // Flag to indicate if product has color variants
  defaultColorVariant: { type: mongoose.Schema.Types.ObjectId }, // Reference to default color variant
  
  // Category and subcategory references
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  },
  subcategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Subcategory'
  },
  
  // Brand reference
  brand: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand'
  },
  
  // Backward compatibility - keep string fields for migration
  categoryName: String, // For backward compatibility
  brandName: String,    // For backward compatibility
  
  stock: { type: Number, default: 0 }, // Total stock (sum of all color variants if applicable)
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false }, // NEW: Mark product as trending
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  
  // Additional product details
  sku: { type: String, unique: true, sparse: true }, // Base SKU - color variants will have their own SKUs
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for better performance (slug already indexed via unique: true)
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ categoryName: 1 }); // Backward compatibility
productSchema.index({ brandName: 1 });    // Backward compatibility
productSchema.index({ isActive: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ trending: 1 }); // NEW: Index for trending products
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ hasColorVariants: 1 }); // NEW: Index for color variants
productSchema.index({ 'colorVariants.sku': 1 }); // NEW: Index for color variant SKUs
productSchema.index({ 'colorVariants.isActive': 1 }); // NEW: Index for active color variants

// Update the updatedAt field before saving
productSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // Calculate sale price if discount is set
  if (this.discount && this.discount.isOnSale && this.discount.percentage > 0) {
    this.discount.salePrice = Math.round(this.price * (1 - this.discount.percentage / 100));
  } else {
    this.discount.salePrice = 0;
  }
  
  // Auto-generate slug if not provided or if name changed
  if (!this.slug || this.isModified('name')) {
    let baseSlug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    let slug = baseSlug;
    let counter = 1;
    
    // Check for existing slugs and append number if needed
    while (true) {
      const existingProduct = await this.constructor.findOne({ 
        slug: slug, 
        _id: { $ne: this._id } // Exclude current product if updating
      });
      
      if (!existingProduct) {
        break; // Slug is unique
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  
  // Update hasColorVariants flag based on colorVariants array
  this.hasColorVariants = this.colorVariants && this.colorVariants.length > 0;
  
  // Calculate total stock from color variants if they exist
  if (this.hasColorVariants) {
    this.stock = this.colorVariants.reduce((total, variant) => total + (variant.stock || 0), 0);
  }
  
  // Set default color variant if not set and variants exist
  if (this.hasColorVariants && !this.defaultColorVariant && this.colorVariants.length > 0) {
    this.defaultColorVariant = this.colorVariants[0]._id;
  }
  
  next();
});

// Virtual for getting active color variants
productSchema.virtual('activeColorVariants').get(function() {
  return this.colorVariants ? this.colorVariants.filter(variant => variant.isActive) : [];
});

// Method to add a new color variant
productSchema.methods.addColorVariant = function(colorData) {
  this.colorVariants.push(colorData);
  this.hasColorVariants = true;
  return this.colorVariants[this.colorVariants.length - 1];
};

// Method to update a color variant
productSchema.methods.updateColorVariant = function(variantId, updateData) {
  const variant = this.colorVariants.id(variantId);
  if (variant) {
    Object.assign(variant, updateData);
    return variant;
  }
  return null;
};

// Method to remove a color variant
productSchema.methods.removeColorVariant = function(variantId) {
  const variant = this.colorVariants.id(variantId);
  if (variant) {
    this.colorVariants.pull(variantId);
    this.hasColorVariants = this.colorVariants.length > 0;
    
    // Update default if removed variant was default
    if (this.defaultColorVariant && this.defaultColorVariant.toString() === variantId.toString()) {
      this.defaultColorVariant = this.colorVariants.length > 0 ? this.colorVariants[0]._id : null;
    }
    
    return true;
  }
  return false;
};

// Method to get color variant by ID
productSchema.methods.getColorVariant = function(variantId) {
  return this.colorVariants.id(variantId);
};

// Static method to find products with color variants
productSchema.statics.findWithColorVariants = function() {
  return this.find({ hasColorVariants: true });
};

module.exports = mongoose.model('Product', productSchema);
