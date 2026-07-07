import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    /* ==========================================================
       Basic Information
    ========================================================== */

    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["Stock", "Crypto", "ETF", "Commodity", "Forex"],
      default: "Stock",
    },

    exchange: {
      type: String,
      default: "NASDAQ",
      trim: true,
    },

    sector: {
      type: String,
      default: "",
    },

    industry: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
    },

    currency: {
      type: String,
      default: "USD",
    },

    /* ==========================================================
       Market Data
    ========================================================== */

    currentPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    previousClose: {
      type: Number,
      default: 0,
      min: 0,
    },

    openingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    dayHigh: {
      type: Number,
      default: 0,
      min: 0,
    },

    dayLow: {
      type: Number,
      default: 0,
      min: 0,
    },

    week52High: {
      type: Number,
      default: 0,
      min: 0,
    },

    week52Low: {
      type: Number,
      default: 0,
      min: 0,
    },

    volume: {
      type: Number,
      default: 0,
      min: 0,
    },

    marketCap: {
      type: Number,
      default: 0,
      min: 0,
    },

    change: {
      type: Number,
      default: 0,
    },

    changePercent: {
      type: Number,
      default: 0,
    },

    /* ==========================================================
       Trading Status
    ========================================================== */

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================
   Indexes
========================================================== */

assetSchema.index({ type: 1 });

assetSchema.index({ exchange: 1 });

assetSchema.index({ status: 1 });

const Asset = mongoose.model("Asset", assetSchema);

export default Asset;