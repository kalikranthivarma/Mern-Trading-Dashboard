import Dashboard from "../models/Dashboard.js";
import Portfolio from "../models/Portfolio.js";
import Order from "../models/Order.js";
import Trade from "../models/Trade.js";
import Asset from "../models/Asset.js";

/* ==========================================================
   Dashboard Summary
========================================================== */

export const getDashboardSummary = async (userId) => {
  const dashboard = await Dashboard.findOne({ user: userId }).lean();

  if (dashboard) {
    return dashboard;
  }

  return {
    totalPortfolioValue: 0,
    todaysProfitLoss: 0,
    totalAssets: 0,
    activeOrders: 0,
    completedTrades: 0,
    watchlistCount: 0,
    marketCap: 0,
    tradingVolume: 0,
  };
};

/* ==========================================================
   Market Overview
========================================================== */

export const getMarketOverview = async () => {
  const totalAssets = await Asset.countDocuments();

  return {
    totalAssets,
    marketStatus: "OPEN",
    topGainers: [],
    topLosers: [],
  };
};

/* ==========================================================
   Portfolio Performance
========================================================== */

export const getPerformance = async (userId) => {
  return {
    labels: [],
    portfolioValue: [],
    profitLoss: [],
  };
};

/* ==========================================================
   Recent Trades
========================================================== */

export const getRecentTrades = async (userId) => {
  return await Trade.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
};

/* ==========================================================
   Active Orders
========================================================== */

export const getActiveOrders = async (userId) => {
  return await Order.find({
    user: userId,
    status: "OPEN",
  })
    .sort({ createdAt: -1 })
    .lean();
};

/* ==========================================================
   Watchlist
========================================================== */

export const getWatchlist = async () => {
  return [];
};

/* ==========================================================
   Live Statistics
========================================================== */

export const getLiveStatistics = async () => {
  return {
    serverTime: new Date(),
    activeUsers: 0,
    activeTrades: 0,
    marketStatus: "OPEN",
  };
};