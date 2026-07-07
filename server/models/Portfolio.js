import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    /* ==========================================================
       User Information
    ========================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ==========================================================
       Asset Information
    ========================================================== */

    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    /* ==========================================================
       Holdings
    ========================================================== */

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    averagePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    currentPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ==========================================================
       Investment Summary
    ========================================================== */

    investedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    profitLoss: {
      type: Number,
      default: 0,
    },

    profitLossPercentage: {
      type: Number,
      default: 0,
    },

    totalReturns: {
      type: Number,
      default: 0,
    },

    totalReturnPercentage: {
      type: Number,
      default: 0,
    },

    /* ==========================================================
       Portfolio Status
    ========================================================== */

    status: {
      type: String,
      enum: ["ACTIVE", "SOLD", "CLOSED"],
      default: "ACTIVE",
    },

    /* ==========================================================
       Notes
    ========================================================== */

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================
   Indexes
========================================================== */

portfolioSchema.index({ asset: 1 });

portfolioSchema.index({ status: 1 });

portfolioSchema.index({ user: 1, asset: 1 });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;