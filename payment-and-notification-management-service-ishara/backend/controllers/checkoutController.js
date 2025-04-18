// controllers/checkoutController.js

module.exports.getCheckoutData = async (req, res) => {
    try {
      const orderDB = req.app.locals.dbs.orderDB;
  
      const loadCartModel = require("../models/shared/Cart");
      const loadUserModel = require("../models/shared/User");
  
      const Cart = loadCartModel(orderDB);
      const User = loadUserModel(orderDB);
  
      const userId = req.params.userId;
  
      const cart = await Cart.findOne({ userId });
      const user = await User.findById(userId);
  
      if (!cart || !user) {
        return res.status(404).json({ message: "Cart or user not found" });
      }
  
      res.json({ cart, user });
    } catch (err) {
      console.error("Checkout data fetch error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  