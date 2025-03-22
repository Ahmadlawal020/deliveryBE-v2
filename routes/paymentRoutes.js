const express = require("express");
const {
  initializePayment,
  verifyPayment,
} = require("../controllers/paymentController");

const router = express.Router();

// Initialize Payment
router.post("/initialize", initializePayment);

// Verify Payment
router.get("/verify/:reference", verifyPayment);

module.exports = router;
