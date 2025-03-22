const axios = require("axios");

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// Initialize Payment
const initializePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    const response = await paystack.post("/transaction/initialize", {
      email,
      amount: amount * 100, // Paystack expects amount in kobo
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error initializing payment:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

// Verify Payment
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await paystack.get(`/transaction/verify/${reference}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

module.exports = { initializePayment, verifyPayment };
