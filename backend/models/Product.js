const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // e.g. 'ghee-500'
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jis Admin ne product add kiya
  name: { type: String, required: true },
  category: { type: String, required: true },
  categorySlug: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  unit: { type: String },
  badge: { type: String },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  description: { type: String },
  longDescription: { type: String },
  benefits: [{ type: String }],
  ingredients: { type: String },
  glowColor: { type: String },
  image: { type: String },
  svg: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
