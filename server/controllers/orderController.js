import ApiError from '../utils/ApiError.js';
import { getOrdersForUser, getOrderById as getOrderRecord } from '../services/orderService.js';

export const getOrders = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      side: req.query.side,
      orderType: req.query.orderType,
      limit: Number(req.query.limit || 50)
    };
    const orders = await getOrdersForUser(req.user._id, filters);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await getOrderRecord(req.params.id, req.user._id);
    if (!order) return next(new ApiError(404, 'Order not found'));
    res.json({ order });
  } catch (error) {
    next(error);
  }
};
