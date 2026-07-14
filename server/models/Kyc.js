import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    documents: {
      identityDocument: { type: String, default: "" },
      panCard: { type: String, default: "" },
      aadhaarFront: { type: String, default: "" },
      aadhaarBack: { type: String, default: "" },
      passport: { type: String, default: "" },
      drivingLicense: { type: String, default: "" },
      selfie: { type: String, default: "" },
      addressProof: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected"],
      default: "pending",
    },
    remarks: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster admin querying
kycSchema.index({ status: 1 });
kycSchema.index({ createdAt: -1 });

const Kyc = mongoose.model("Kyc", kycSchema);

export default Kyc;
