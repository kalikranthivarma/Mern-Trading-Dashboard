import Trade from "../models/Trade.js";
import Portfolio from "../models/Portfolio.js";
import Asset from "../models/Asset.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import SystemConfig from "../models/SystemConfig.js";
import ApiError from "../utils/ApiError.js";

/* ==========================================================
   Buy Asset
========================================================== */

export const buyAsset = async (userId, payload) => {
  const { asset, quantity, price } = payload;

  const assetExists = await Asset.findById(asset);
  if (!assetExists) {
    throw new ApiError(404, "Asset not found");
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const totalAmount = quantity * price;

  // Calculate Trade Fee
  const config = await SystemConfig.findOne();
  const feePercent = config?.tradingFeePercent || 0.1;
  const fee = totalAmount * (feePercent / 100);
  const totalCost = totalAmount + fee;

  if ((user.availableBalance || 0) < totalCost) {
    throw new ApiError(400, `Insufficient balance. Required: ₹${totalCost.toFixed(2)}`);
  }

  // Deduct from wallet
  user.availableBalance -= totalCost;
  await user.save();

  // Create Trade Record
  const trade = await Trade.create({
    user: userId,
    asset,
    tradeType: "BUY",
    quantity,
    price,
    totalAmount,
  });

  // Update Portfolio
  let portfolio = await Portfolio.findOne({ user: userId, asset });
  if (portfolio) {
    const newQuantity = portfolio.quantity + quantity;
    const newInvestedAmount = (portfolio.quantity * portfolio.averagePrice) + totalAmount;
    portfolio.averagePrice = newInvestedAmount / newQuantity;
    portfolio.quantity = newQuantity;
    portfolio.status = "ACTIVE";
    await portfolio.save();
  } else {
    await Portfolio.create({
      user: userId,
      asset,
      quantity,
      averagePrice: price,
      investedAmount: totalAmount,
      status: "ACTIVE"
    });
  }

  // Record Transaction
  await Transaction.create({
    user: userId,
    type: 'trade',
    amount: totalCost,
    currency: 'INR',
    reference: `BUY-${trade._id.toString().substring(0,8).toUpperCase()}`,
    status: 'completed'
  });

  return trade;
};

/* ==========================================================
   Sell Asset
========================================================== */

export const sellAsset = async (userId, payload) => {
  const { asset, quantity, price } = payload;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  let portfolio = await Portfolio.findOne({ user: userId, asset, status: "ACTIVE" });
  if (!portfolio || portfolio.quantity < quantity) {
    throw new ApiError(400, "Insufficient portfolio quantity to sell");
  }

  const totalAmount = quantity * price;

  // Calculate Trade Fee
  const config = await SystemConfig.findOne();
  const feePercent = config?.tradingFeePercent || 0.1;
  const fee = totalAmount * (feePercent / 100);
  const netAmount = totalAmount - fee;

  // Add to wallet
  user.availableBalance = (user.availableBalance || 0) + netAmount;
  await user.save();

  // Create Trade Record
  const trade = await Trade.create({
    user: userId,
    asset,
    tradeType: "SELL",
    quantity,
    price,
    totalAmount,
  });

  // Update Portfolio
  portfolio.quantity -= quantity;
  if (portfolio.quantity === 0) {
    portfolio.status = "SOLD";
  }
  await portfolio.save();

  // Record Transaction
  await Transaction.create({
    user: userId,
    type: 'trade',
    amount: netAmount,
    currency: 'INR',
    reference: `SELL-${trade._id.toString().substring(0,8).toUpperCase()}`,
    status: 'completed'
  });

  return trade;
};

/* ==========================================================
   Trade History
========================================================== */

export const getTradeHistory = async (userId) => {
  return Trade.find({ user: userId })
    .populate("asset", "symbol name currentPrice")
    .sort({ createdAt: -1 })
    .lean();
};

/* ==========================================================
   Trade Details
========================================================== */

export const getTradeById = async (userId, tradeId) => {
  const trade = await Trade.findOne({
    _id: tradeId,
    user: userId,
  }).populate("asset");

  if (!trade) {
    throw new ApiError(404, "Trade not found");
  }

  return trade;
};

/* ==========================================================
   Delete Trade
========================================================== */

export const deleteTrade = async (tradeId) => {
  await Trade.findByIdAndDelete(tradeId);

  return {
    message: "Trade deleted successfully",
  };
};