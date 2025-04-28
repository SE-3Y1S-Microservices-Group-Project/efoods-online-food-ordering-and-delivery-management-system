const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  customerId: { type: String , required: true }, //type: mongoose.Schema.Types.ObjectId, ref: 'User'
  orderId: { type: String, required: true }, // 
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  paymentId: { type: String }, 

});

module.exports = (paymentDB) => {
  return paymentDB.models.Payment || paymentDB.model('Payment', PaymentSchema);
};
