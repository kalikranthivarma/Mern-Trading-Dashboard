import {
  getDashboardSummary,
  getMarketOverview,
  getPerformance,
  getRecentTrades,
  getActiveOrders,
  getWatchlist,
  getLiveStatistics,
} from "../services/dashboardService.js";

/* ==========================================================
   Dashboard Summary
========================================================== */

export const dashboardSummary = async (req, res, next) => {
  try {
    const data = await getDashboardSummary(req.user._id);

    res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Market Overview
========================================================== */

export const marketOverview = async (req, res, next) => {
  try {
    const data = await getMarketOverview();

    res.status(200).json({
      success: true,
      message: "Market overview fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Portfolio Performance
========================================================== */

export const portfolioPerformance = async (req, res, next) => {
  try {
    const data = await getPerformance(req.user._id);

    res.status(200).json({
      success: true,
      message: "Portfolio performance fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Recent Trades
========================================================== */

export const recentTrades = async (req, res, next) => {
  try {
    const data = await getRecentTrades(req.user._id);

    res.status(200).json({
      success: true,
      message: "Recent trades fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Active Orders
========================================================== */

export const activeOrders = async (req, res, next) => {
  try {
    const data = await getActiveOrders(req.user._id);

    res.status(200).json({
      success: true,
      message: "Active orders fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Watchlist
========================================================== */

export const watchlist = async (req, res, next) => {
  try {
    const data = await getWatchlist(req.user._id);

    res.status(200).json({
      success: true,
      message: "Watchlist fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Live Statistics
========================================================== */

export const liveStatistics = async (req, res, next) => {
  try {
    const data = await getLiveStatistics();

    res.status(200).json({
      success: true,
      message: "Live statistics fetched successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
};