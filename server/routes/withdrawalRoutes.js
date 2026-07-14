import express from "express";
import {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from "../controllers/withdrawalController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================================
   User Routes
========================================================== */
router.post("/request", protect, requestWithdrawal);
router.get("/my-withdrawals", protect, getMyWithdrawals);

/* ==========================================================
   Admin Routes
========================================================== */
router.get(
  "/admin/all",
  protect,
  authorize("admin", "superadmin"),
  getAllWithdrawals
);

router.post(
  "/admin/:id/approve",
  protect,
  authorize("admin", "superadmin"),
  approveWithdrawal
);

router.post(
  "/admin/:id/reject",
  protect,
  authorize("admin", "superadmin"),
  rejectWithdrawal
);

export default router;
