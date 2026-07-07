import Portfolio from '../models/Portfolio.js';
import Trade from '../models/Trade.js';
import Asset from '../models/Asset.js';

export const getPortfolioByUser = async (userId) => Portfolio.findOne({ user: userId });

export const createOrUpdatePortfolio = async (userId, data) =>
  Portfolio.findOneAndUpdate({ user: userId }, { ...data, user: userId }, { upsert: true, new: true });

export const rebuildUserPortfolio = async (userId) => {
  const trades = await Trade.find({ user: userId, status: 'filled' }).populate('asset');
  const holdings = {};
  let totalValue = 0;

  for (const trade of trades) {
    const symbol = trade.asset.symbol;
    const position = holdings[symbol] || { assetId: trade.asset._id, symbol, name: trade.asset.name, quantity: 0, costBasis: 0, currentValue: 0 };

    const signedQty = trade.side === 'buy' ? trade.quantity : -trade.quantity;
    position.quantity += signedQty;
    position.costBasis += signedQty * trade.price;
    position.currentValue = position.quantity * trade.asset.currentPrice;
    position.unrealizedPnL = position.currentValue - position.costBasis;
    holdings[symbol] = position;
  }

  const allocation = {};
  for (const symbol in holdings) {
    const position = holdings[symbol];
    totalValue += position.currentValue;
  }

  for (const symbol in holdings) {
    allocation[symbol] = totalValue > 0 ? Number(((holdings[symbol].currentValue / totalValue) * 100).toFixed(2)) : 0;
  }

  const portfolioData = {
    totalValue,
    allocation,
    holdings: Object.values(holdings),
    metrics: {
      positions: Object.values(holdings).length,
      totalCost: Object.values(holdings).reduce((sum, item) => sum + item.costBasis, 0),
      totalUnrealizedPnL: Object.values(holdings).reduce((sum, item) => sum + item.unrealizedPnL, 0)
    }
  };

  return createOrUpdatePortfolio(userId, portfolioData);
};
