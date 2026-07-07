export const calculatePortfolio = (trades, assets) => {
  const holdings = {};

  for (const trade of trades) {
    const assetId = trade.asset?._id || trade.asset;
    const assetObj = assets.find((a) => a._id === assetId || a.symbol === assetId || a.symbol === trade.asset?.symbol);
    if (!assetObj) continue;

    const symbol = assetObj.symbol;
    if (!holdings[symbol]) {
      holdings[symbol] = {
        assetId: assetObj._id,
        symbol: assetObj.symbol,
        name: assetObj.name,
        quantity: 0,
        costBasis: 0,
        currentValue: 0,
        unrealizedPnL: 0
      };
    }

    const isBuy = trade.tradeType === 'BUY';
    const signedQty = isBuy ? trade.quantity : -trade.quantity;

    if (isBuy) {
      holdings[symbol].quantity += signedQty;
      holdings[symbol].costBasis += trade.quantity * trade.price;
    } else {
      const prevQty = holdings[symbol].quantity;
      const prevCost = holdings[symbol].costBasis;
      const avgCost = prevQty > 0 ? prevCost / prevQty : 0;
      
      holdings[symbol].quantity = Math.max(0, prevQty - trade.quantity);
      holdings[symbol].costBasis = Math.max(0, prevCost - (trade.quantity * avgCost));
    }
  }

  // Filter out empty holdings
  const activeHoldings = Object.values(holdings).filter((h) => h.quantity > 0);

  let totalValue = 0;
  for (const pos of activeHoldings) {
    const assetObj = assets.find((a) => a.symbol === pos.symbol);
    pos.currentPrice = assetObj?.currentPrice || 0;
    pos.currentValue = pos.quantity * pos.currentPrice;
    pos.unrealizedPnL = pos.currentValue - pos.costBasis;
    totalValue += pos.currentValue;
  }

  const allocation = {};
  for (const pos of activeHoldings) {
    pos.allocation = totalValue > 0 ? Number(((pos.currentValue / totalValue) * 100).toFixed(2)) : 0;
    allocation[pos.symbol] = pos.allocation;
  }

  const totalCost = activeHoldings.reduce((sum, item) => sum + item.costBasis, 0);

  return {
    totalValue,
    allocation,
    holdings: activeHoldings,
    metrics: {
      positions: activeHoldings.length,
      totalCost,
      totalUnrealizedPnL: totalValue - totalCost
    }
  };
};
