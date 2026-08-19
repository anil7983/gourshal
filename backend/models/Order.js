const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    unit: { type: String }
  }],
  address: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    addr1: { type: String, required: true },
    addr2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pin: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true },
  paymentId: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  discountAmt: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  expectedDelivery: { type: String },
  refundReason: { type: String }
}, { timestamps: true });

orderSchema.index({ userId: 1 });
orderSchema.index({ orderId: 1 });

module.exports = mongoose.model('Order', orderSchema);
