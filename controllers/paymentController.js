const axios = require("axios");
const User = require("../models/User");

// @desc Initialize Paystack payment
// @route POST /paystack/initiate
// @access Private
const initiatePayment = async (req, res) => {
  const { email, amount } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ message: "Email and amount are required" });
  }

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack works with kobo (i.e., Naira * 100)
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Payment initialization failed", error });
  }
};
// @desc Verify Paystack payment
// @route GET /paystack/verify/:reference
// @access Private

// const verifyPayment = async (req, res) => {
//   const { reference } = req.params;

//   try {
//     const response = await axios.get(
//       `https://api.paystack.co/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         },
//       }
//     );

//     const data = response.data;

//     if (data.data.status === "success") {
//       const userEmail = data.data.customer.email;
//       const amountPaid = data.data.amount / 100;
//       const paystackRef = data.data.reference;

//       const user = await User.findOne({ email: userEmail }).exec();
//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       // Prevent double processing
//       if (user.processedReferences?.includes(paystackRef)) {
//         return res.status(200).json({
//           message: "Payment already processed",
//           balance: user.balance,
//           depositedAmount: 0,
//         });
//       }

//       // Deposit the amount ONCE
//       user.balance += amountPaid;
//       user.processedReferences = user.processedReferences || [];
//       user.processedReferences.push(paystackRef);

//       await user.save();

//       return res.status(200).json({
//         message: "Payment verified and balance updated",
//         balance: user.balance,
//         depositedAmount: amountPaid,
//       });
//     } else {
//       return res.status(400).json({ message: "Payment verification failed" });
//     }
//   } catch (error) {
//     console.error("Verification error:", error.message);
//     return res
//       .status(500)
//       .json({ message: "Server error during verification" });
//   }
// };

const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  if (!reference) {
    return res
      .status(400)
      .json({ message: "Transaction reference is required." });
  }

  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return res
        .status(500)
        .json({ message: "Paystack secret key not configured." });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const { data } = response.data;

    if (!data || data.status !== "success") {
      return res.status(400).json({ message: "Payment verification failed." });
    }

    const userEmail = data.customer.email;
    const amountPaid = data.amount / 100; // Convert back from Kobo
    const paystackRef = data.reference;

    const user = await User.findOne({ email: userEmail }).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure processedReferences array exists
    user.processedReferences = user.processedReferences || [];

    // Prevent duplicate processing
    if (user.processedReferences.includes(paystackRef)) {
      return res.status(200).json({
        message: "Payment already processed",
        balance: user.balance || 0,
        depositedAmount: 0,
      });
    }

    // Ensure balance is initialized
    user.balance = user.balance || 0;
    user.balance += amountPaid;
    user.processedReferences.push(paystackRef);

    await user.save();

    return res.status(200).json({
      message: "Payment verified and balance updated",
      balance: user.balance,
      depositedAmount: amountPaid,
    });
  } catch (error) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "Server error during payment verification",
      error: error.response?.data?.message || error.message,
    });
  }
};
module.exports = {
  initiatePayment,
  verifyPayment,
};

// controllers/paystackController.js
