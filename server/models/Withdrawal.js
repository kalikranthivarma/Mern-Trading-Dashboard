import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    processingFee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["UPI", "Bank Transfer"],
      required: true,
    },
    bankDetails: {
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      upiId: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Rejected", "Failed"],
      default: "Pending",
    },
    remarks: {
      type: String,
      default: "",
    },
    referenceNumber: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================
   Indexes
========================================================== */

withdrawalSchema.index({ user: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ createdAt: -1 });

const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

export default Withdrawal;
