const mongoose = require('mongoose');

const FailedTransactionLogSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentId: { type: String },
    statusCode: { type: String },
    reason: { type: String },
    receivedAt: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError
module.exports = (paymentDB) => {
    return paymentDB.models.FailedTransactionLog || paymentDB.model('FailedTransactionLog', FailedTransactionLogSchema);
};
