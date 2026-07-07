import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    /* ==========================================================
       User Reference
    ========================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ==========================================================
       File Information
    ========================================================== */

    filename: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    /* ==========================================================
       GridFS File ID
    ========================================================== */

    gridFsId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    /* ==========================================================
       File Category
    ========================================================== */

    category: {
      type: String,
      enum: [
        "Document",
        "Profile",
        "PAN",
        "Aadhar",
        "Passport",
        "Resume",
        "Certificate",
        "Report",
        "Portfolio",
        "Trade",
      ],
      default: "Document",
    },

    /* ==========================================================
       File Status
    ========================================================== */

    status: {
      type: String,
      enum: ["Active", "Deleted", "Archived"],
      default: "Active",
    },

    /* ==========================================================
       Extra Metadata
    ========================================================== */

    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================
   Indexes
========================================================== */

documentSchema.index({ filename: 1 });

documentSchema.index({ category: 1 });

documentSchema.index({ status: 1 });

const Document = mongoose.model("Document", documentSchema);

export default Document;