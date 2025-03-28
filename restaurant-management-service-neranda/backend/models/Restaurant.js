// backend/models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: String,
  contact: String,
  description: String,  
  image: [String],
  menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  rating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  deliveryFee: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
