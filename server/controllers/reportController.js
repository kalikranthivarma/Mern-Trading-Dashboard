import { listReports } from '../services/reportService.js';

export const getReports = async (req, res, next) => {
  try {
    const reports = await listReports(req.user._id, Number(req.query.limit || 50));
    res.json({ reports });
  } catch (error) {
    next(error);
  }
};
