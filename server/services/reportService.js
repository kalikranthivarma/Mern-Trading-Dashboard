import Report from '../models/Report.js';

export const createReport = async (payload) => Report.create(payload);

export const listReports = async (userId, limit = 50) =>
  Report.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
