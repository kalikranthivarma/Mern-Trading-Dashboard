import Order from '../models/Order.js';

export const createOrder = async (payload) => Order.create(payload);

export const getOrdersForUser = async (userId, filters = {}) => {
  const query = { user: userId };
  if (filters.status) query.status = filters.status;
  if (filters.side) query.side = filters.side;
  if (filters.orderType) query.orderType = filters.orderType;
  return Order.find(query).sort({ placedAt: -1 }).limit(filters.limit || 50);
};

export const getOrderById = async (orderId, userId) => Order.findOne({ _id: orderId, user: userId });

export const updateOrderStatus = async (orderId, status, updates = {}) =>
  Order.findByIdAndUpdate(orderId, { status, ...updates }, { new: true });
