import User from "../models/User.js";
import Asset from "../models/Asset.js";
import Transaction from "../models/Transaction.js"; // Keep just in case
import Order from "../models/Order.js"; // Keep just in case
import Payment from "../models/Payment.js";
import Trade from "../models/Trade.js";
import Portfolio from "../models/Portfolio.js";
import SystemConfig from "../models/SystemConfig.js";
import Notification from "../models/Notification.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Helper function to generate tokens
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

/* ==========================================================
   Admin Authentication
========================================================== */

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, "Please provide email and password"));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || user.role !== "admin") {
      return next(new ApiError(401, "Invalid credentials or unauthorized"));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ApiError(401, "Invalid credentials or unauthorized"));
    }

    if (!user.isActive) {
      return next(new ApiError(403, "Your admin account has been suspended"));
    }

    const token = generateToken(user._id);

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAdmin = async (req, res, next) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new ApiError(400, "User already exists"));
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ApiError(404, "Admin not found"));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Dashboard Stats
========================================================== */

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({ role: "user", isActive: true });
    const suspendedUsers = await User.countDocuments({ role: "user", isActive: false });
    const verifiedUsers = await User.countDocuments({ role: "user", isVerified: true });
    const admins = await User.countDocuments({ role: "admin" });

    const totalAssets = await Asset.countDocuments();
    const activeAssets = await Asset.countDocuments({ isTradingEnabled: true });
    const listedAssets = totalAssets; // Assuming all are listed

    const tradesList = await Trade.find();
    const paymentsList = await Payment.find().sort({ createdAt: -1 }).limit(10);
    const recentUsers = await User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5).select("name email createdAt isVerified isActive");
    
    const totalOrders = tradesList.length;
    const completedOrders = tradesList.length;
    const pendingOrders = 0;
    const cancelledOrders = 0;
    const todaysTrades = tradesList.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;

    // --- DYNAMIC FINANCIAL STATS ---
    const volumeAggregation = await Trade.aggregate([
      { $project: { tradeValue: { $multiply: ["$quantity", "$price"] } } },
      { $group: { _id: null, totalVolume: { $sum: "$tradeValue" } } }
    ]);
    const totalTradingVolume = volumeAggregation.length > 0 ? volumeAggregation[0].totalVolume : 0;

    const exchangeRevenue = totalTradingVolume * 0.001;
    
    const platformProfit = exchangeRevenue * 0.8;

    const depositAgg = await Payment.aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalDeposits = depositAgg.length > 0 ? depositAgg[0].total : 0;
    const totalWithdrawals = 0; // Not tracked in Payment currently
    const walletBalance = totalDeposits - totalWithdrawals;

    const openIssues = 0; // Or could be count of unread alerts

    // --- DYNAMIC LISTS ---
    const topTraders = await Trade.aggregate([
      { $group: { _id: "$user", volume: { $sum: { $multiply: ["$quantity", "$price"] } } } },
      { $sort: { volume: -1 } },
      { $limit: 3 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "userDoc" } },
      { $unwind: "$userDoc" },
      { $project: { _id: 0, name: "$userDoc.name", volume: 1, profit: { $multiply: ["$volume", 0.05] } } }
    ]);

    const allAssetsSorted = await Asset.find().sort({ changePercent: -1 });
    const topAssets = allAssetsSorted.slice(0, 2).map(a => ({ 
      symbol: a.symbol, 
      change: `${a.changePercent >= 0 ? '+' : ''}${a.changePercent?.toFixed(2) || '0.00'}%` 
    }));
    const losingAssets = allAssetsSorted.slice(-2).reverse().map(a => ({ 
      symbol: a.symbol, 
      change: `${a.changePercent >= 0 ? '+' : ''}${a.changePercent?.toFixed(2) || '0.00'}%` 
    }));

    res.status(200).json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, verified: verifiedUsers, admins },
        assets: { total: totalAssets, active: activeAssets, listed: listedAssets },
        orders: { total: totalOrders, completed: completedOrders, pending: pendingOrders, cancelled: cancelledOrders, todaysTrades },
        financials: { totalTradingVolume, exchangeRevenue, platformProfit, walletBalance, openIssues },
        recentTransactions: paymentsList,
        recentRegistrations: recentUsers,
        topTraders,
        topAssets,
        losingAssets
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   User Management
========================================================== */

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return next(new ApiError(404, "User not found"));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return next(new ApiError(404, "User not found"));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) return next(new ApiError(404, "User not found"));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select("-password");

    if (!user) return next(new ApiError(404, "User not found"));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new ApiError(404, "User not found"));
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Asset Management
========================================================== */

export const getAssets = async (req, res, next) => {
  try {
    const assets = await Asset.find();
    res.status(200).json({ success: true, data: assets });
  } catch (error) {
    next(error);
  }
};

export const createAsset = async (req, res, next) => {
  try {
    const asset = await Asset.create(req.body);
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!asset) return next(new ApiError(404, "Asset not found"));
    res.status(200).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (!asset) return next(new ApiError(404, "Asset not found"));
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Transactions Management
========================================================== */

export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Payment.find().populate("user", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Analytics
========================================================== */

export const getAnalytics = async (req, res, next) => {
  try {
    // --- Trading Volume & Revenue ---
    const volumeAgg = await Trade.aggregate([
      { $group: { _id: null, totalVolume: { $sum: { $multiply: ["$quantity", "$price"] } } } }
    ]);
    const tradingVolume = volumeAgg.length > 0 ? volumeAgg[0].totalVolume : 0;

    const revenue = tradingVolume * 0.001;

    // --- Daily Trades (Last 30 Days) ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyAgg = await Trade.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          volume: { $sum: { $multiply: ["$quantity", "$price"] } },
          uniqueUsers: { $addToSet: "$user" }
        }
      },
      { $project: { _id: 0, date: "$_id", volume: 1, users: { $size: "$uniqueUsers" } } },
      { $sort: { date: 1 } }
    ]);

    const dailyTrades = dailyAgg.map(d => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: d.volume,
      users: d.users
    }));

    // --- Asset Distribution ---
    const assetAgg = await Asset.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { _id: 0, name: "$_id", value: "$count" } }
    ]);
    const totalAssets = await Asset.countDocuments();
    const assetDistribution = assetAgg.map(a => ({
      name: a.name || 'Unknown',
      value: totalAssets > 0 ? Math.round((a.value / totalAssets) * 100) : 0
    }));

    // --- Revenue Trend (Last 12 Months) ---
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyAgg = await Trade.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          volume: { $sum: { $multiply: ["$quantity", "$price"] } }
        }
      },
      { $project: { _id: 0, monthStr: "$_id", revenue: { $multiply: ["$volume", 0.001] } } },
      { $sort: { monthStr: 1 } }
    ]);
    
    const revenueTrend = monthlyAgg.map(m => ({
      month: new Date(m.monthStr + "-01").toLocaleDateString('en-US', { month: 'short' }),
      revenue: m.revenue
    }));

    const data = {
      tradingVolume,
      revenue,
      dailyTrades,
      assetDistribution,
      revenueTrend
    };
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Order Management
========================================================== */

export const getOrders = async (req, res, next) => {
  try {
    const orders = await Trade.find()
      .populate("user", "name email")
      .populate("asset", "symbol name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Trade.findById(req.params.id);
    if (!order) return next(new ApiError(404, "Trade not found"));
    
    // In this app trades execute immediately, but leaving route for compatibility
    return next(new ApiError(400, "Trades are executed immediately and cannot be cancelled"));
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Market Status & Settings
========================================================== */

export const getSettings = async (req, res, next) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ marketStatus: "open" });
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

export const updateMarketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ marketStatus: status });
    } else {
      config.marketStatus = status;
      await config.save();
    }
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Notifications
========================================================== */

export const getAdminNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const createGlobalNotification = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;
    
    const notification = await Notification.create({
      user: req.user._id, 
      title,
      message,
      type: type || "SYSTEM",
      isRead: false
    });
    
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};
