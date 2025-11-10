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
  price: { type: Number, required: true }, // store INR/INR paise conversion in frontend/backend
  
  // Enhanced image schema
  images: [imageSchema], // Detailed image objects
  
  // Backward compatibility - simple image URLs array
  imageUrls: [String], // Simple URLs for backward compatibility
  
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
  
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
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
  sku: { type: String, unique: true, sparse: true }, // Stock Keeping Unit
  rating: { type: Number, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ categoryName: 1 }); // Backward compatibility
productSchema.index({ brandName: 1 });    // Backward compatibility
productSchema.index({ isActive: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Auto-generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
