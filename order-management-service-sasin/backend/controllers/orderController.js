const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Place new order (from cart)
exports.createOrder = async (req, res) => {
  const { userId, shippingInfo } = req.body;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.productId.price, // might need populated product price
      0
    );
    const order = await Order.create({
      userId,
      items: cart.items,
      shippingInfo,
      totalAmount,
    });
    // Optionally clear cart after placing order
    await Cart.findOneAndDelete({ userId });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark order as paid
exports.markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders of a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};