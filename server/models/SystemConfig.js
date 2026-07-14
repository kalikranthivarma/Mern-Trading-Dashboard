import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    marketStatus: {
      type: String,
      enum: ["open", "closed", "maintenance", "emergency"],
      default: "open",
    },
    maintenanceMessage: {
      type: String,
      default: "System is currently under maintenance. Please try again later.",
    },
    tradingFeePercent: {
      type: Number,
      default: 0.1, // 0.1% per trade
    },
    withdrawalFeeFlat: {
      type: Number,
      default: 25.0, // Base platform fee
    },
    withdrawalProcessingFee: {
      type: Number,
      default: 10.0, // Bank processing fee
    },
    gstPercent: {
      type: Number,
      default: 18.0, // 18% GST on fees
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists
systemConfigSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await mongoose.model("SystemConfig").countDocuments();
    if (count > 0) {
      return next(new Error("Only one SystemConfig document can exist."));
    }
  }
  next();
});

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);

export default SystemConfig;
