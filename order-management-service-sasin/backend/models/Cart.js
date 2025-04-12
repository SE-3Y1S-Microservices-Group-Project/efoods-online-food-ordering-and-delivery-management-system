const mongoose = require('mongoose');

const CartSchema = mongoose.Schema ({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Prodcuct',
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
            },
        ],
}, 
    { 
        timestamps: true 
    }
);

module.exports = mongoose.model('Cart', CartSchema);
