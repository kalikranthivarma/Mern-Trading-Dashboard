import express from "express";
import {
  loginAdmin,
  logoutAdmin,
  createAdmin,
  getAdminProfile,
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  suspendUser,
  activateUser,
  deleteUser,
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getTransactions,
  getAnalytics,
  updateMarketStatus,
  getOrders,
  cancelOrder,
  getSettings,
  updateSettings,
  getAdminNotifications,
  createGlobalNotification,
  getPendingKyc,
  approveRejectKyc,
} from "../controllers/adminController.js";
import { protect, adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ==========================================================
   Public Admin Routes (Login)
========================================================== */
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);

/* ==========================================================
   Protected Admin Routes
========================================================== */
router.use(protect);
router.use(adminProtect);

// Auth & Profile
router.post("/create", createAdmin);
router.get("/profile", getAdminProfile);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Users
router.route("/users")
  .get(getUsers);
router.route("/users/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/activate", activateUser);

// KYC
router.get("/kyc/pending", getPendingKyc);
router.patch("/kyc/:id", approveRejectKyc);

// Assets
router.route("/assets")
  .get(getAssets)
  .post(createAsset);
router.route("/assets/:id")
  .put(updateAsset)
  .delete(deleteAsset);

// Transactions
router.get("/transactions", getTransactions);

// Analytics
router.get("/analytics", getAnalytics);

// Market Status
router.patch("/market/open", (req, res, next) => {
  req.body.status = "open";
  updateMarketStatus(req, res, next);
});
router.patch("/market/close", (req, res, next) => {
  req.body.status = "closed";
  updateMarketStatus(req, res, next);
});
router.patch("/market/pause", (req, res, next) => {
  req.body.status = "maintenance";
  updateMarketStatus(req, res, next);
});
router.patch("/market/resume", (req, res, next) => {
  req.body.status = "open";
  updateMarketStatus(req, res, next);
});

// Orders
router.get("/orders", getOrders);
router.patch("/orders/:id/cancel", cancelOrder);

// Settings
router.route("/settings")
  .get(getSettings)
  .put(updateSettings);
router.patch("/settings/market-status", updateMarketStatus);

// Notifications
router.route("/notifications")
  .get(getAdminNotifications)
  .post(createGlobalNotification);

export default router;
