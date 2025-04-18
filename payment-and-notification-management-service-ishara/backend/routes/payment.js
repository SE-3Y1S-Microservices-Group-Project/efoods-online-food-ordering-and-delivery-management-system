const express = require("express");
const router = express.Router();

const {
  createPayment,
  notifyPayment,
} = require("../controllers/paymentController");

router.post("/create", createPayment);
router.post("/notify", notifyPayment);

module.exports = router;
