const express = require('express');
const router = express.Router();
const {
    createOrder,
    markOrderAsPaid,
    getUserOrders,
    getAllOrders
} = require('../controllers/orderController');

// @route   POST /api/orders
// @desc    Place new order (from cart)
router.post('/', createOrder);

// @route   PUT /api/orders/:orderId/pay
// @desc    Mark order as paid
router.put('/:orderId/pay', markOrderAsPaid);

// @route   GET /api/orders/user/:userId
// @desc    Get all orders of a user
router.get('/user/:userId', getUserOrders);

// @route   GET /api/orders
// @desc    Get all orders (admin)
router.get('/', getAllOrders);

module.exports = router;