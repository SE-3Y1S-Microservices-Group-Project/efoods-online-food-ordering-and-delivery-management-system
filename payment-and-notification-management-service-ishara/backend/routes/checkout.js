// routes/checkout.js

const express = require("express");
const router = express.Router();

const { getCheckoutData } = require("../controllers/checkoutController");

router.get("/:userId", getCheckoutData);

module.exports = router;
