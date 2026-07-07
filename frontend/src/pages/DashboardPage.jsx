import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import SmallChart from '../components/SmallChart';
import { useSocket } from '../hooks/useSocket';
import { getAssets } from '../services/assetService';
import { getTradeHistory } from '../services/tradingService';
import { calculatePortfolio } from '../utils/portfolioCalc';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [trades, setTrades] = useState([]);
  const [assets, setAssets] = useState([]);
  const [topAssets, setTopAssets] = useState([]);
  const [marketUpdates, setMarketUpdates] = useState([]);
  const { on, off } = useSocket();

  const loadData = async () => {
    try {
      const assetData = await getAssets();
      const allAssets = assetData.assets || assetData || [];
      setAssets(allAssets);
      setTopAssets(allAssets.slice(0, 4));

      const tradeResponse = await getTradeHistory();
      const allTrades = tradeResponse.data || tradeResponse.history || tradeResponse || [];
      setTrades(allTrades);
    } catch (error) {
      console.error('Dashboard load failed', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleMarketData = (updates) => {
      const nextUpdates = Array.isArray(updates) ? updates : [updates];

      // 1. Update general assets array with new prices in real-time
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const match = nextUpdates.find((u) => u.symbol === asset.symbol);
          return match ? { ...asset, currentPrice: match.price } : asset;
        })
      );

      // 2. Update top assets
      setTopAssets((prevTop) =>
        prevTop.map((asset) => {
          const match = nextUpdates.find((u) => u.symbol === asset.symbol);
          return match ? { ...asset, currentPrice: match.price } : asset;
        })
      );

      // 3. Update scrolling market updates feed
      setMarketUpdates((current) => {
        return [...nextUpdates, ...current].slice(0, 6);
      });
    };

    on('marketData', handleMarketData);
    return () => off('marketData', handleMarketData);
  }, [on, off]);

  // Compute portfolio values dynamically in 100% real-time!
  const portfolio = useMemo(() => {
    return calculatePortfolio(trades, assets);
  }, [trades, assets]);

  const handlePortfolioReport = () => {
    if (!portfolio || portfolio.holdings.length === 0) {
      toast.error('No holdings available to generate report');
      return;
    }
    toast.success('Generating Portfolio Report...');

    let content = `TradePulse Portfolio Report\nGenerated: ${new Date().toLocaleString()}\n\n`;
    content += `Positions Count: ${portfolio.metrics.positions}\n`;
    content += `Total Value: $${portfolio.totalValue.toFixed(2)}\n`;
    content += `Total Cost Basis: $${portfolio.metrics.totalCost.toFixed(2)}\n`;
    content += `Total Unrealized P/L: $${portfolio.metrics.totalUnrealizedPnL.toFixed(2)}\n\n`;
    content += `Holdings Detail:\n`;
    content += `Symbol | Name | Quantity | Cost Basis | Current Value | P/L | Allocation\n`;
    content += `---------------------------------------------------------------------------\n`;

    portfolio.holdings.forEach((h) => {
      content += `${h.symbol} | ${h.name} | ${h.quantity} | $${h.costBasis.toFixed(2)} | $${h.currentValue.toFixed(2)} | $${h.unrealizedPnL.toFixed(2)} | ${h.allocation}%\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio_report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully!');
  };

  const summaryData = useMemo(() => {
    const positions = portfolio?.metrics?.positions || 0;
    const totalUnrealized = portfolio?.metrics?.totalUnrealizedPnL || 0;
    const portfolioValue = portfolio?.totalValue || 0;

    return [
      {
        title: 'Open positions',
        value: positions.toString(),
        trend: positions > 0 ? '+9%' : '0%',
        description: 'Active holdings in portfolio',
        icon: <TrendingUp className="h-6 w-6" />
      },
      {
        title: 'Unrealized P/L',
        value: `$${totalUnrealized.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        trend: totalUnrealized >= 0 ? '+4.2%' : '-1.6%',
        description: 'Current paper gains / losses',
        icon: <ArrowUpRight className="h-6 w-6" />
      },
      {
        title: 'Portfolio value',
        value: `$${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        trend: '+1.4%',
        description: 'Net asset value',
        icon: <Activity className="h-6 w-6" />
      },
      {
        title: 'Market signal',
        value: 'Bullish',
        trend: '+2.1%',
        description: 'Momentum indicator',
        icon: <ArrowDownRight className="h-6 w-6" />
      }
    ];
  }, [portfolio]);

  const chartData = useMemo(() => {
    if (portfolio?.holdings?.length > 0) {
      return portfolio.holdings.map((h) => ({
        label: h.symbol,
        value: Math.round(h.currentValue || 0)
      }));
    }

    return [
      { label: 'Mon', value: 102 },
      { label: 'Tue', value: 131 },
      { label: 'Wed', value: 118 },
      { label: 'Thu', value: 168 },
      { label: 'Fri', value: 180 }
    ];
  }, [portfolio]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white">Trading Dashboard</h1>
          <p className="mt-2 text-slate-400">Real-time performance and market signals for your portfolio.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadData}
            className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
          >
            Refresh data
          </button>
          <button
            onClick={handlePortfolioReport}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10"
          >
            Portfolio report
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-2">
        {summaryData.map((item) => (
          <DashboardCard key={item.title} {...item} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Portfolio growth</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">${portfolio?.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</h2>
            </div>
            <div className="rounded-3xl bg-slate-900 px-4 py-2 text-sm text-sky-300">Live stream</div>
          </div>
          <SmallChart data={chartData} />
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white">Risk analysis</h3>
            <p className="mt-3 text-slate-400">View current exposure, drawdown risk, and position leverage.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-900 p-4 text-slate-200">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Positions</p>
                <p className="mt-3 text-3xl font-semibold text-white">{portfolio?.metrics?.positions || 0}</p>
              </div>
              <div className="rounded-3xl bg-slate-900 p-4 text-slate-200">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Unrealized P/L</p>
                <p className="mt-3 text-3xl font-semibold text-white">${(portfolio?.metrics?.totalUnrealizedPnL || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white">Market pulse</h3>
            <p className="mt-3 text-slate-400">Active traders, order book depth and sector momentum.</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900 p-4">
                <div>
                  <p className="text-sm text-slate-400">Active traders</p>
                  <p className="text-2xl font-semibold text-white">{marketUpdates.length * 120 || 4028}</p>
                </div>
                <Activity className="h-6 w-6 text-sky-300" />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-900 p-4">
                <div>
                  <p className="text-sm text-slate-400">Volume signal</p>
                  <p className="mt-2 text-2xl font-semibold text-white">${((portfolio?.totalValue || 0) * 0.03).toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white">Market feed</h3>
          <div className="mt-4 space-y-3">
            {marketUpdates.length === 0 ? (
              <p className="text-slate-400">Waiting for market data updates...</p>
            ) : (
              marketUpdates.map((update, index) => (
                <div
                  key={`${update.symbol}-${index}`}
                  className="flex items-center justify-between rounded-3xl bg-slate-900 p-4"
                >
                  <div>
                    <p className="text-sm text-slate-400">{update.symbol}</p>
                    <p className="mt-1 text-lg font-semibold text-white">${update.price.toFixed(2)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      update.change >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
                    }`}
                  >
                    {update.change >= 0 ? '+' : ''}{update.change.toFixed(2)}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-white">Top assets</h3>
          <div className="mt-4 space-y-3">
            {topAssets.length === 0 ? (
              <p className="text-slate-400">No top assets loaded yet.</p>
            ) : (
              topAssets.map((asset) => (
                <div key={asset._id} className="rounded-3xl bg-slate-900 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{asset.name}</p>
                      <p className="mt-1 text-lg font-semibold text-white">${asset.currentPrice?.toFixed(2)}</p>
                    </div>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{asset.symbol}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
