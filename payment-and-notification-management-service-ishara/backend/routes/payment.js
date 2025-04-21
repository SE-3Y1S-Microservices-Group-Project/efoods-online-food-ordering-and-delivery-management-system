const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Fetch order + user + card data
router.get("/checkout/:userId", paymentController.getCheckoutInfo);
// Save new card
//router.post("/card", paymentController.addCard);
// Initiates a payment and redirects to PayHere
router.post("/process", paymentController.processPayment);
// Handles PayHere's payment notification callback
router.post("/notify", paymentController.notifyPayment);
// Get saved card details
router.get("/saved-cards/:userId", paymentController.getSavedCards);
// New route to save card
router.post("/ card", paymentController.saveNewCard);


module.exports = router;
