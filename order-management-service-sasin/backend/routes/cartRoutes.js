const express = require('express');
const router = express.Router();
const {
  addItemToCart,
  getCartItems,
  updateItemQuantity,
  removeCartItem
} = require ('../controllers/cartController.js');

// @route   POST /api/cart
// @desc    Add item to cart or update quantity
router.post('/', addItemToCart);

// @route   GET /api/cart/:userId
// @desc    Get cart items
router.get('/:userId', getCartItems);

// @route   PUT /api/cart/:userId
// @desc    Update quantity of a specific item
router.put('/:userId', updateItemQuantity);

// @route   DELETE /api/cart/:userId/:productId
// @desc    Remove an item from cart
router.delete('/:userId/:productId', removeCartItem);

module.exports = router;