import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

/* ==========================================================
   Protect Routes
========================================================== */

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new ApiError(401, "Access token is missing"));
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find User
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new ApiError(401, "User not found"));
    }

    if (!user.isActive) {
      return next(new ApiError(403, "User account is disabled"));
    }

    if (!user.isVerified) {
      return next(new ApiError(403, "Email verification required"));
    }

    req.user = user;

    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
};

/* ==========================================================
   Role Based Authorization
========================================================== */

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Required role: ${roles.join(", ")}`
        )
      );
    }

    next();
  };
};

/* ==========================================================
   Admin Protect Middleware
========================================================== */

export const adminProtect = authorize("admin");

/* ==========================================================
   User Protect Middleware
========================================================== */

export const userProtect = authorize("user");

/* ==========================================================
   Optional Authentication
========================================================== */

export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
