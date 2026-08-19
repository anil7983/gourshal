const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  paymentDetails: {
    bankAccount: { type: String },
    ifscCode: { type: String },
    accountHolderName: { type: String },
    razorpayAccountId: { type: String }
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

userSchema.virtual('fullName').get(function() {
  return this.name;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
