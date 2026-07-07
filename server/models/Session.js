import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
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
       Refresh Token (Hashed)
    ========================================================== */

    refreshTokenHash: {
      type: String,
      required: true,
      select: false,
    },

    /* ==========================================================
       Client Information
    ========================================================== */

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    deviceName: {
      type: String,
      default: "",
    },

    /* ==========================================================
       Session Status
    ========================================================== */

    revokedAt: {
      type: Date,
      default: null,
    },

    replacedByTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ==========================================================
   Additional MongoDB Indexes
========================================================== */

// Only keep indexes that are NOT already defined above
sessionSchema.index({ revokedAt: 1 });

/* ==========================================================
   Virtual Properties
========================================================== */

sessionSchema.virtual("isExpired").get(function () {
  return this.expiresAt <= new Date();
});

sessionSchema.virtual("isRevoked").get(function () {
  return this.revokedAt !== null;
});

/* ==========================================================
   Instance Methods
========================================================== */

sessionSchema.methods.revoke = function () {
  this.revokedAt = new Date();
  return this.save();
};

/* ==========================================================
   Hide Sensitive Fields
========================================================== */

sessionSchema.methods.toJSON = function () {
  const session = this.toObject();

  delete session.refreshTokenHash;
  delete session.replacedByTokenHash;
  delete session.__v;

  return session;
};

/* ==========================================================
   Model
========================================================== */

const Session = mongoose.model("Session", sessionSchema);

export default Session;