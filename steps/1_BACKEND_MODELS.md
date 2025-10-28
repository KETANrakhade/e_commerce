# 🗄️ Backend Models Implementation

## Order Model
**File: `backend/models/orderModel.js`**

```javascript
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String }
});

const shippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  phone: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: { type: String, required: true, enum: ['COD', 'Online'] },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
  status: { 
    type: String, 
    required: true, 
    default: 'pending',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
  },
  orderNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'PYR' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
```