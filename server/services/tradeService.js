import Trade from "../models/Trade.js";
import Portfolio from "../models/Portfolio.js";
import Asset from "../models/Asset.js";
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

  const totalAmount = quantity * price;

  const trade = await Trade.create({
    user: userId,
    asset,
    tradeType: "BUY",
    quantity,
    price,
    totalAmount,
  });

  return trade;
};

/* ==========================================================
   Sell Asset
========================================================== */

export const sellAsset = async (userId, payload) => {
  const { asset, quantity, price } = payload;

  const totalAmount = quantity * price;

  const trade = await Trade.create({
    user: userId,
    asset,
    tradeType: "SELL",
    quantity,
    price,
    totalAmount,
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