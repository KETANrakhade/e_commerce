const mongoose = require('mongoose');

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
  images: [String], // cloud-uploaded URLs
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  brand: String,
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create indexes for better performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
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
