import { useEffect, useState } from 'react';
import { getAssets } from '../services/assetService';
import { Search, Filter, TrendingUp, DollarSign, Activity } from 'lucide-react';

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await getAssets();
        setAssets(response.assets || response || []);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const categories = ['All', 'Stock', 'Crypto', 'Forex', 'ETF', 'Commodity'];

  const filteredAssets = assets.filter((asset) => {
    const name = (asset.name || '').toLowerCase();
    const symbol = (asset.symbol || '').toLowerCase();
    const query = search.toLowerCase();
    const category = asset.category || asset.type || 'Stock';

    const matchesSearch = name.includes(query) || symbol.includes(query);
    const matchesCategory = selectedCategory === 'All' || category.toLowerCase().startsWith(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Market Assets</h1>
          <p className="mt-2 text-slate-400">Browse categories and real-time details for stocks, cryptos, and other instruments.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-slate-900/50 pl-11 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-sky-500 text-white'
                : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {cat}s
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-400 border-t-transparent"></div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl bg-slate-900/50 p-6 text-center">
          <p className="text-slate-400">No assets found matching the criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const cat = asset.category || asset.type || 'Stock';
            return (
              <div key={asset._id} className="glass-card rounded-3xl p-6 space-y-4 hover:border-sky-500/30 transition flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-sky-400">
                        {cat}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">{asset.symbol}</span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-[rgb(var(--text-primary))]">{asset.name}</h3>
                  <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{asset.sector || 'Market Instrument'}</p>
                </div>

                <div className="pt-4 border-t border-[rgba(var(--border-subtle))] flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider">Current Price</p>
                    <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">
                      ₹{asset.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Market Cap</p>
                    <p className="text-sm font-semibold text-slate-300 mt-1">
                      ₹{(asset.marketCap / 1e9).toFixed(1)}B
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default AssetsPage;
