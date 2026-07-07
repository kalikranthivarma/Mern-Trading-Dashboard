import {
  buyAsset,
  sellAsset,
  getTradeHistory,
  getTradeById,
  deleteTrade,
} from "../services/tradeService.js";

/* ==========================================================
   Buy Asset
========================================================== */

export const buy = async (req, res, next) => {
  try {
    const trade = await buyAsset(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: "Asset purchased successfully.",
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Sell Asset
========================================================== */

export const sell = async (req, res, next) => {
  try {
    const trade = await sellAsset(req.user._id, req.body);

    res.status(201).json({
      success: true,
      message: "Asset sold successfully.",
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Trade History
========================================================== */

export const history = async (req, res, next) => {
  try {
    const trades = await getTradeHistory(req.user._id);

    res.status(200).json({
      success: true,
      count: trades.length,
      data: trades,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Trade Details
========================================================== */

export const details = async (req, res, next) => {
  try {
    const trade = await getTradeById(
      req.user._id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================================
   Delete Trade
========================================================== */

export const remove = async (req, res, next) => {
  try {
    const result = await deleteTrade(req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};