const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Fetch order + user + card data
router.get("/placeorder/:userId", paymentController.getCheckoutInfo);


// stripe pay

router.post("/process", paymentController.createCheckoutSession);

//webhook
router.post("/webhook",paymentController.handleWebhook);

//Fetch session details
router.get('/session/:sessionId', paymentController.getSessionDetails);



module.exports = router;
