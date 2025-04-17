// backend/models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  contact: String,
  description: String,
  address: String, // full address text or street address
  country: String,
  state: String,
  city: String,
  image: [String],
  menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  rating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  deliveryFee: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  isAvailable: { type: Boolean, default: true },
  openingTime: { type: String, default: '09:00' },
  closingTime: { type: String, default: '22:00' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})


module.exports = mongoose.model('Restaurant', restaurantSchema);
