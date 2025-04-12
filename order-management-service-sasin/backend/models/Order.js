const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema ({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Product',
            },
            quantity: {
                type: Number,
                required: true
            },
        },
    ],
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        postalCode: { 
            type: String,
            required: true
        },
        country: { 
            type: String,
            required: true
        },
    },
    totalAmount: {
        type: Number,
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
}, {
    timestamps: true
}
);

module.exports = mongoose.model('Order', OrderSchema);