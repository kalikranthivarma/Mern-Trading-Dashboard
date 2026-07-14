import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// ==========================================================
// Create Razorpay Order
// ==========================================================

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid amount.",
      });
    }

    if (req.user.kycStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your KYC must be approved by an Admin before you can deposit funds.",
      });
    }

    const options = {
      amount: amount * 100, // Convert ₹ to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order.",
      error: error.message,
    });
  }
};

// ==========================================================
// Verify Razorpay Payment
// ==========================================================

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
    } = req.body;

    // Validate request
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !amount
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing.",
      });
    }

    // Generate Signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Verify Signature
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    // Prevent duplicate payment records
    const existingPayment = await Payment.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment already exists.",
      });
    }

    // Save Payment
    const payment = await Payment.create({
      user: req.user._id,
      amount,
      currency: "INR",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "Success",
    });

    // Add amount to user's available balance
    const user = await User.findById(req.user._id);
    user.availableBalance = (user.availableBalance || 0) + Number(amount);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      payment,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment verification failed.",
      error: error.message,
    });
  }
};