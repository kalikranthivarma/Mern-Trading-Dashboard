import express from "express";

import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  changePassword,
  updateProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";

import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
  changePasswordValidation,
  updateProfileValidation,
} from "../validations/authValidation.js";

const router = express.Router();

/* ==========================================================
   Authentication
========================================================== */

router.post(
  "/register",
  registerValidation,
  validateRequest,
  registerUser
);

router.post(
  "/login",
  loginValidation,
  validateRequest,
  loginUser
);

router.post("/refresh", refreshToken);

router.post("/logout", logoutUser);

/* ==========================================================
   Password
========================================================== */

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validateRequest,
  forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  resetPassword
);

/* ==========================================================
   Email Verification
========================================================== */

router.get(
  "/verify-email/:token",
  verifyEmailValidation,
  validateRequest,
  verifyEmail
);

router.post(
  "/resend-verification",
  forgotPasswordValidation,
  validateRequest,
  resendVerificationEmail
);

/* ==========================================================
   Profile
========================================================== */

router.patch(
  "/change-password",
  protect,
  changePasswordValidation,
  validateRequest,
  changePassword
);

router.patch(
  "/profile",
  protect,
  updateProfileValidation,
  validateRequest,
  updateProfile
);

export default router;