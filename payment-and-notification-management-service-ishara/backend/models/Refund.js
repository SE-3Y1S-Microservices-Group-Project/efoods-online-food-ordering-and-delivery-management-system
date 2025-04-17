const mongoose = require("mongoose");

const RefundSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  transactionId: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Refund", RefundSchema);
