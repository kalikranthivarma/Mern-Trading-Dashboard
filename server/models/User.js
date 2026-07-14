import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    /* ==========================================================
       Basic Information
    ========================================================== */

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    /* ==========================================================
       Wallet Balances
    ========================================================== */

    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    lockedBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    /* ==========================================================
       User Role
    ========================================================== */

    role: {
      type: String,
      enum: ["user", "admin", "superadmin", "support"],
      default: "user",
    },

    /* ==========================================================
       Account Status
    ========================================================== */

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /* ==========================================================
       KYC Settings
    ========================================================== */

    kycStatus: {
      type: String,
      enum: ["unverified", "pending", "approved", "rejected"],
      default: "unverified",
    },

    kycDocument: {
      type: String,
      default: "", // URL or gridfs reference to the ID doc
    },

    /* ==========================================================
       Profile
    ========================================================== */

    profileImage: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    /* ==========================================================
       Email Verification
    ========================================================== */

    emailVerificationToken: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
      select: false,
    },

    lastVerificationEmailSentAt: {
      type: Date,
      default: null,
    },

    /* ==========================================================
       Password Reset
    ========================================================== */

    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
      select: false,
    },

    /* ==========================================================
       Login Tracking
    ========================================================== */

    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    /* ==========================================================
       GridFS Documents
    ========================================================== */

    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],

    /* ==========================================================
       Additional Metadata
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
   MongoDB Indexes
========================================================== */

userSchema.index({ role: 1 });

userSchema.index({ isVerified: 1 });

userSchema.index({ isActive: 1 });

userSchema.index({
  passwordResetToken: 1,
  passwordResetExpires: 1,
});

userSchema.index({
  emailVerificationToken: 1,
  emailVerificationExpires: 1,
});

/* ==========================================================
   Hash Password Before Saving
========================================================== */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/* ==========================================================
   Compare Password
========================================================== */

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ==========================================================
   Check Account Lock
========================================================== */

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

/* ==========================================================
   Remove Sensitive Fields
========================================================== */

userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.__v;

  return user;
};

/* ==========================================================
   Model
========================================================== */

const User = mongoose.model("User", userSchema);

export default User;