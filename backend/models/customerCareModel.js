const mongoose = require('mongoose');

const customerCareSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['return', 'exchange', 'support'],
    required: true
  },
  orderId: {
    type: String
  },
  productName: {
    type: String
  },
  // Return specific fields
  reason: {
    type: String
  },
  // Exchange specific fields
  exchangeType: {
    type: String,
    enum: ['size', 'color', 'both']
  },
  preference: {
    type: String
  },
  // Support specific fields
  name: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  subject: {
    type: String
  },
  message: {
    type: String
  },
  // Common fields
  details: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'open', 'closed'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  resolvedDate: {
    type: Date
  },
  adminNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
customerCareSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes
customerCareSchema.index({ user: 1 });
customerCareSchema.index({ type: 1 });
customerCareSchema.index({ status: 1 });
customerCareSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CustomerCare', customerCareSchema);
