const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  cardNumber: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  cvv: {
    type: String,   
    required: true
  },
  cardHolderName: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = (paymentDB) => {
  return paymentDB.models.Card || paymentDB.model("Card", CardSchema);
};
