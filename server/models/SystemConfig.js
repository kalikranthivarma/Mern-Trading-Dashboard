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
