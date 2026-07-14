import Withdrawal from "../models/Withdrawal.js";
import User from "../models/User.js";
import SystemConfig from "../models/SystemConfig.js";
import Transaction from "../models/Transaction.js";
import ApiError from "../utils/ApiError.js";

/* ==========================================================
   Request Withdrawal (User)
========================================================== */
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, method, bankDetails, remarks } = req.body;
    
    // 1. Validations
    if (!amount || amount < 100) {
      return next(new ApiError(400, "Minimum withdrawal amount is ₹100"));
    }
    if (amount > 1000000) {
      return next(new ApiError(400, "Maximum withdrawal amount is ₹10,000,000"));
    }

    const user = await User.findById(req.user._id);
    if (!user) return next(new ApiError(404, "User not found"));

    if (user.kycStatus !== "approved") {
      return next(new ApiError(403, "KYC must be approved to request a withdrawal"));
    }

    if (!user.isActive || user.isLocked) {
      return next(new ApiError(403, "Account is suspended or locked"));
    }

    // Initialize availableBalance if not set
    const available = user.availableBalance || 0;
    
    if (available < amount) {
      return next(new ApiError(400, "Insufficient available balance"));
    }

    // 2. Calculate Fees dynamically
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({}); // Fallback
    }

    const platformFee = config.withdrawalFeeFlat || 25;
    const processingFee = config.withdrawalProcessingFee || 10;
    const gstPercent = config.gstPercent || 18;
    
    const gstAmount = (platformFee + processingFee) * (gstPercent / 100);
    const totalCharges = platformFee + processingFee + gstAmount;
    
    if (amount <= totalCharges) {
      return next(new ApiError(400, "Withdrawal amount must be greater than total fees"));
    }

    const netAmount = amount - totalCharges;

    // 3. Update Balances (Deduct Available, Increase Locked)
    user.availableBalance = available - amount;
    user.lockedBalance = (user.lockedBalance || 0) + amount;
    await user.save();

    // 4. Create Pending Withdrawal Request
    const withdrawal = await Withdrawal.create({
      user: user._id,
      amount,
      platformFee,
      processingFee,
      gst: gstAmount,
      netAmount,
      method,
      bankDetails,
      remarks,
      status: "Pending",
      referenceNumber: `WTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: withdrawal,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Get My Withdrawals (User)
========================================================== */
export const getMyWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Get All Withdrawals (Admin)
========================================================== */
export const getAllWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate("user", "name email profileImage kycStatus")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Approve Withdrawal (Admin)
========================================================== */
export const approveWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const withdrawal = await Withdrawal.findById(id).populate("user");
    if (!withdrawal) return next(new ApiError(404, "Withdrawal not found"));

    if (withdrawal.status !== "Pending" && withdrawal.status !== "Processing") {
      return next(new ApiError(400, `Cannot approve a withdrawal that is ${withdrawal.status}`));
    }

    const user = withdrawal.user;

    // 1. Deduct from Locked Balance
    if (user.lockedBalance >= withdrawal.amount) {
      user.lockedBalance -= withdrawal.amount;
    } else {
      user.lockedBalance = 0; // Safeguard
    }
    await user.save();

    // 2. Update Withdrawal Status
    withdrawal.status = "Completed";
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = new Date();
    withdrawal.completedAt = new Date();
    if (remarks) withdrawal.remarks = remarks;
    await withdrawal.save();

    // 3. Create Transaction Ledger Entry
    await Transaction.create({
      user: user._id,
      type: "withdrawal",
      amount: withdrawal.amount,
      currency: "INR",
      reference: withdrawal.referenceNumber,
      status: "completed"
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal approved and completed",
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Reject Withdrawal (Admin)
========================================================== */
export const rejectWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const withdrawal = await Withdrawal.findById(id).populate("user");
    if (!withdrawal) return next(new ApiError(404, "Withdrawal not found"));

    if (withdrawal.status !== "Pending") {
      return next(new ApiError(400, `Cannot reject a withdrawal that is ${withdrawal.status}`));
    }

    const user = withdrawal.user;

    // 1. Refund to Available Balance, reduce Locked Balance
    if (user.lockedBalance >= withdrawal.amount) {
      user.lockedBalance -= withdrawal.amount;
    } else {
      user.lockedBalance = 0;
    }
    user.availableBalance += withdrawal.amount;
    await user.save();

    // 2. Update Withdrawal Status
    withdrawal.status = "Rejected";
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = new Date();
    if (remarks) withdrawal.remarks = remarks;
    await withdrawal.save();

    // 3. Create Failed Transaction Ledger Entry
    await Transaction.create({
      user: user._id,
      type: "withdrawal",
      amount: withdrawal.amount,
      currency: "INR",
      reference: withdrawal.referenceNumber,
      status: "failed"
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal rejected and funds refunded",
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};
