// controllers/paymentController.js

exports.createPayment = async (req, res) => {
    try {
      const {
        userId,
        orderId,
        amount,
        first_name,
        last_name,
        email,
        phone,
        address,
      } = req.body;
  
      const Payment = require("../models/Payment")(req.app.locals.dbs.paymentDB);
  
      const transaction = new Payment({
        customerId: userId,
        orderId,
        amount,
        status: "Pending",
      });
  
      await transaction.save();
  
      const redirectURL = "https://sandbox.payhere.lk/pay/checkout";
  
      const paymentData = {
        merchant_id: process.env.PAYHERE_MERCHANT_ID,
        return_url: process.env.PAYHERE_RETURN_URL,
        cancel_url: process.env.PAYHERE_CANCEL_URL,
        notify_url: process.env.PAYHERE_NOTIFY_URL,
        order_id: orderId,
        items: "Food Order Payment",
        amount,
        currency: "LKR",
        first_name,
        last_name,
        email,
        phone,
        address,
        city: "Colombo",
        country: "Sri Lanka",
      };
  
      res.json({ redirectURL, paymentData });
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(500).json({ message: "Payment request failed" });
    }
  };
  
  exports.notifyPayment = async (req, res) => {
    const { order_id, status_code } = req.body;
  
    try {
      const Payment = require("../models/Payment")(req.app.locals.dbs.paymentDB);
  
      const transaction = await Payment.findOne({ orderId: order_id });
  
      if (!transaction) return res.status(404).json({ message: "Transaction not found" });
  
      transaction.status = status_code === "2" ? "Completed" : "Failed";
      await transaction.save();
  
      return res.sendStatus(200);
    } catch (error) {
      console.error("Payment notification error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  