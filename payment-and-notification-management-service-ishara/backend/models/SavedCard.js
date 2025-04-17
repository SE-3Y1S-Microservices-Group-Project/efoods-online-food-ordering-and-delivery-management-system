
const mongoose = require('mongoose');

const savedCardSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardHolderName: String,
  cardNumber: String, // (store only last 4 digits or use tokenization)
  expiryMonth: String,
  expiryYear: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.SavedCard || mongoose.model('SavedCard', savedCardSchema);
