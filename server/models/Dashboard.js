import mongoose from "mongoose";

const dashboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    totalPortfolioValue: {
      type: Number,
      default: 0,
    },

    todaysProfitLoss: {
      type: Number,
      default: 0,
    },

    totalAssets: {
      type: Number,
      default: 0,
    },

    activeOrders: {
      type: Number,
      default: 0,
    },

    completedTrades: {
      type: Number,
      default: 0,
    },

    watchlistCount: {
      type: Number,
      default: 0,
    },

    marketCap: {
      type: Number,
      default: 0,
    },

    tradingVolume: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Dashboard = mongoose.model("Dashboard", dashboardSchema);

export default Dashboard;