import { useEffect, useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, Briefcase, Percent, DollarSign } from 'lucide-react';
import { getAssets } from '../services/assetService';
import { getTradeHistory } from '../services/tradingService';
import { calculatePortfolio } from '../utils/portfolioCalc';

const PortfolioPage = () => {
  const [trades, setTrades] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      try {
        const assetData = await getAssets();
        setAssets(assetData.assets || assetData || []);

        const tradeResponse = await getTradeHistory();
        const allTrades = tradeResponse.data || tradeResponse.history || tradeResponse || [];
        setTrades(allTrades);
      } catch (error) {
        console.error('Failed to load portfolio details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolioDetails();
  }, []);

  const portfolio = useMemo(() => {
    return calculatePortfolio(trades, assets);
  }, [trades, assets]);

  const totalValue = portfolio?.totalValue || 0;
  const holdingsList = portfolio?.holdings || [];
  const allocation = portfolio?.allocation || {};
  const metrics = portfolio?.metrics || {
    positions: 0,
    totalCost: 0,
    totalUnrealizedPnL: 0
  };

  const hasHoldings = holdingsList.length > 0;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Portfolio</h1>
        <p className="mt-2 text-slate-400">Monitor your holdings, allocations, and live performance statistics.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-400 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-sm font-semibold uppercase tracking-wider">Net worth</span>
                  <DollarSign className="h-5 w-5 text-sky-400" />
                </div>
                <p className="mt-4 text-4xl font-bold text-sky-300">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="mt-4 text-xs text-slate-500">Based on latest market closing prices</p>
            </div>

            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-sm font-semibold uppercase tracking-wider">Total investment</span>
                  <Briefcase className="h-5 w-5 text-purple-400" />
                </div>
                <p className="mt-4 text-4xl font-bold text-white">
                  ${(metrics.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="mt-4 text-xs text-slate-500">Total cost basis of all positions</p>
            </div>

            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-sm font-semibold uppercase tracking-wider">Unrealized return</span>
                  {metrics.totalUnrealizedPnL >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-rose-500" />
                  )}
                </div>
                <p className={`mt-4 text-4xl font-bold ${metrics.totalUnrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  ${(metrics.totalUnrealizedPnL || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="mt-4 text-xs text-slate-500">Paper gains & losses on open trades</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-card rounded-3xl p-6 overflow-hidden">
              <h2 className="text-xl font-semibold text-white">Positions</h2>
              <div className="mt-6 overflow-x-auto">
                {!hasHoldings ? (
                  <p className="text-slate-400 text-center py-8">No open positions found.</p>
                ) : (
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Asset</th>
                        <th className="py-3 px-4 text-right">Quantity</th>
                        <th className="py-3 px-4 text-right">Cost basis</th>
                        <th className="py-3 px-4 text-right">Market value</th>
                        <th className="py-3 px-4 text-right">Unrealized P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {holdingsList.map((position) => {
                        const isProfit = position.unrealizedPnL >= 0;
                        return (
                          <tr key={position.symbol} className="hover:bg-white/5 transition">
                            <td className="py-4 px-4 font-semibold text-white">
                              <div>
                                <p className="font-semibold">{position.symbol}</p>
                                <p className="text-xs text-slate-500">{position.name}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-medium">{position.quantity}</td>
                            <td className="py-4 px-4 text-right font-medium">
                              ${position.costBasis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-white">
                              ${position.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className={`py-4 px-4 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-500'}`}>
                              {isProfit ? '+' : ''}
                              {position.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-white">Asset Allocation</h2>
              <div className="mt-6 space-y-4">
                {!hasHoldings ? (
                  <p className="text-slate-400 text-center py-8">No allocations calculated.</p>
                ) : (
                  holdingsList.map((position) => {
                    const percent = allocation[position.symbol] || 0;
                    return (
                      <div key={position.symbol} className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                          <span className="text-white">{position.symbol}</span>
                          <span className="text-slate-300">{percent}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sky-500 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default PortfolioPage;
