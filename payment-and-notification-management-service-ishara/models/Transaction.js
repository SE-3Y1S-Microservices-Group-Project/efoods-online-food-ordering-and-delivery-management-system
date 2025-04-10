const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Customer ID
  orderId: { type: String, required: true }, // Order ID
  amount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
