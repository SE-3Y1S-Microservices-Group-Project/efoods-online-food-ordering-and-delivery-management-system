const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Restaurant or Rider ID
  role: { type: String, enum: ["Restaurant", "Rider", "Admin"], required: true },
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model("Wallet", WalletSchema);
