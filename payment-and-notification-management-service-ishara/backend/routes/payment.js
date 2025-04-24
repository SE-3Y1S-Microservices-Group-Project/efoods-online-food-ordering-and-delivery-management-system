const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Fetch order + user + card data
router.get("/checkout/:userId", paymentController.getCheckoutInfo);



// Add to your payment controller
// const dumpRequest = (req, res, next) => {
//     console.log("=== PayHere Request Dump ===");
//     console.log("Headers:", req.headers);
//     console.log("Body:", req.body);
//     console.log("Query:", req.query);
//     next();
//   };
  
//   router.post("/proceed", dumpRequest, paymentController.processPayment);

// stripe pay
// routes/payment.js
router.post("/process", paymentController.createCheckoutSession);

//webhook
router.post("/webhook",paymentController.handleWebhook);

// // Handles PayHere's payment notification callback
// router.post("/notify", paymentController.notifyPayment);
// Get saved card details



module.exports = router;
