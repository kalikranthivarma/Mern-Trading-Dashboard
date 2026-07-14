import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getAssets } from '../services/assetService';
import { placeOrder, getTradeHistory } from '../services/tradingService';
import { createPaymentOrder, verifyPaymentSignature } from '../services/paymentService';
import { useSocket } from '../hooks/useSocket';
import { useDispatch } from 'react-redux';
import { updateProfile } from '../redux/slices/authSlice';
import api from '../services/api';
import TradingChart from '../components/trading/TradingChart';

const TradingPage = () => {
  const [assets, setAssets] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  const { on, off } = useSocket();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      assetId: '',
      side: 'buy',
      orderType: 'market',
      quantity: 1,
      price: 0
    }
  });

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetResponse = await getAssets({ limit: 8 });
        setAssets(assetResponse.assets || assetResponse || []);

        const tradeResponse = await getTradeHistory({ limit: 5 });
        setRecentTrades(tradeResponse.data || tradeResponse.history || tradeResponse || []);
      } catch (error) {
        console.error('Trading page load failed', error);
      }
    };

    loadAssets();
  }, []);

  useEffect(() => {
    const handleMarketData = (updates) => {
      const nextData = Array.isArray(updates) ? updates : [updates];
      setLiveFeed((current) => [...nextData, ...current].slice(0, 8));
    };

    const handleTradeExecuted = (payload) => {
      setRecentTrades((current) => [payload.trade, ...current].slice(0, 5));
      setLiveFeed((current) => [
        {
          symbol: payload.trade.asset.symbol,
          price: payload.trade.price,
          change: payload.trade.side === 'buy' ? 0.25 : -0.12
        },
        ...current
      ].slice(0, 8));
    };

    on('marketData', handleMarketData);
    on('tradeExecuted', handleTradeExecuted);

    return () => {
      off('marketData', handleMarketData);
      off('tradeExecuted', handleTradeExecuted);
    };
  }, [on, off]);

  const onSubmit = async (values) => {
    try {
      const selectedAsset = assets.find((a) => a._id === values.assetId);
      if (!selectedAsset) {
        toast.error('Please select an asset');
        return;
      }

      const price = values.orderType === 'limit' ? Number(values.price) : selectedAsset.currentPrice || 0;
      const quantity = Number(values.quantity);
      
      if (quantity <= 0) {
        toast.error('Invalid order quantity');
        return;
      }

      const payload = {
        asset: values.assetId,
        side: values.side,
        quantity: quantity,
        price: price
      };

      const tradeResponse = await placeOrder(payload);
      const tradeData = tradeResponse.data || tradeResponse;
      const executedTrade = {
        ...tradeData,
        asset: selectedAsset,
        tradeType: values.side.toUpperCase()
      };

      toast.success(`Order executed successfully!`);
      setRecentTrades((current) => [executedTrade, ...current].slice(0, 5));
      
      // Update wallet balance after trade
      try {
        const { data } = await api.get('/users/me');
        if (data.success && data.data && data.data.user) {
          dispatch(updateProfile(data.data.user));
        }
      } catch (err) {
        console.error("Failed to update wallet balance", err);
      }
      
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Order submission failed');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold">Trading</h1>
        <p className="mt-2 text-slate-400">Create orders, view live price action, and manage positions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-4 sm:gap-6">
        <div className="glass-card rounded-3xl p-4 sm:p-6">
          <h2 className="text-xl font-semibold">Order ticket</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-400">
              Asset
              <select
                {...register('assetId', { required: 'Select an asset' })}
                className="mt-2 w-full rounded-3xl px-4 py-3"
              >
                <option value="">Select asset</option>
                {assets.map((asset) => (
                  <option key={asset._id} value={asset._id}>
                    {asset.symbol} — {asset.name}
                  </option>
                ))}
              </select>
            </label>
            {errors.assetId && <p className="text-sm text-rose-400">{errors.assetId.message}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-400">
                Side
                <select
                  {...register('side')}
                  className="mt-2 w-full rounded-3xl px-4 py-3"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </label>
              <label className="block text-sm text-slate-400">
                Type
                <select
                  {...register('orderType')}
                  className="mt-2 w-full rounded-3xl px-4 py-3"
                >
                  <option value="market">Market</option>
                  <option value="limit">Limit</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-400">
                Quantity
                <input
                  type="number"
                  {...register('quantity', {
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1' }
                  })}
                  className="mt-2 w-full rounded-3xl px-4 py-3"
                />
              </label>
              <label className="block text-sm text-slate-400">
                Limit price
                <input
                  type="number"
                  step="0.01"
                  {...register('price')}
                  className="mt-2 w-full rounded-3xl px-4 py-3"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-3xl bg-sky-500 px-5 py-3 text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit order
            </button>
          </form>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="glass-card rounded-3xl p-4 sm:p-6 h-[300px] sm:h-[460px]">
            <TradingChart theme="dark" symbol="MARKET" />
          </div>

          <div className="glass-card rounded-3xl p-4 sm:p-6">
            <h2 className="text-xl font-semibold">Recent trades</h2>
            <div className="mt-4 space-y-3">
              {recentTrades.length === 0 ? (
                <p className="text-slate-400">No recent trades available.</p>
              ) : (
                recentTrades.map((trade) => (
                  <div key={trade._id} className="rounded-3xl glass-card p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">{trade.asset?.symbol || trade.asset}</p>
                        <p className="mt-1 text-base sm:text-lg font-semibold">{trade.side?.toUpperCase()} {trade.quantity}@${trade.price?.toFixed(2)}</p>
                      </div>
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{trade.status || 'submitted'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingPage;
