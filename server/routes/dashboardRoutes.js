import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  dashboardSummary,
  marketOverview,
  portfolioPerformance,
  recentTrades,
  activeOrders,
  watchlist,
  liveStatistics,
} from "../controllers/dashboardController.js";

const router = express.Router();

/* ==========================================================
   Dashboard Summary
========================================================== */

router.get(
  "/summary",
  protect,
  dashboardSummary
);

/* ==========================================================
   Market Overview
========================================================== */

router.get(
  "/market-overview",
  protect,
  marketOverview
);

/* ==========================================================
   Portfolio Performance
========================================================== */

router.get(
  "/performance",
  protect,
  portfolioPerformance
);

/* ==========================================================
   Recent Trades
========================================================== */

router.get(
  "/recent-trades",
  protect,
  recentTrades
);

/* ==========================================================
   Active Orders
========================================================== */

router.get(
  "/active-orders",
  protect,
  activeOrders
);

/* ==========================================================
   Watchlist
========================================================== */

router.get(
  "/watchlist",
  protect,
  watchlist
);

/* ==========================================================
   Live Statistics
========================================================== */

router.get(
  "/live-statistics",
  protect,
  liveStatistics
);

export default router;