import { getPortfolioByUser, rebuildUserPortfolio } from '../services/portfolioService.js';

export const getPortfolio = async (req, res, next) => {
  try {
    let portfolio = await getPortfolioByUser(req.user._id);
    if (!portfolio) {
      portfolio = await rebuildUserPortfolio(req.user._id);
    }
    res.json({ portfolio });
  } catch (error) {
    next(error);
  }
};
