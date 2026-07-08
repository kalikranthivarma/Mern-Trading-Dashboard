import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getAssets } from '../services/assetService';
import { placeOrder, getTradeHistory } from '../services/tradingService';
import { createPaymentOrder, verifyPaymentSignature } from '../services/paymentService';
import { useSocket } from '../hooks/useSocket';

const TradingPage = () => {
  const [assets, setAssets] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  const { on, off } = useSocket();

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
      const price = values.orderType === 'limit' ? Number(values.price) : selectedAsset?.currentPrice || 0;
      const quantity = Number(values.quantity);
      const totalAmount = quantity * price;

      if (totalAmount <= 0) {
        toast.error('Invalid order amount');
        return;
      }

      // Create Payment Order
      const paymentOrderResponse = await createPaymentOrder(totalAmount);
      
      if (!paymentOrderResponse.success) {
        throw new Error('Failed to create payment order');
      }

      const orderOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: paymentOrderResponse.order.amount,
        currency: paymentOrderResponse.order.currency,
        name: 'Financial Trading Dashboard',
        description: `Trade ${quantity} ${selectedAsset.symbol}`,
        order_id: paymentOrderResponse.order.id,
        handler: async (response) => {
          try {
            // Verify Payment Signature
            const verifyResponse = await verifyPaymentSignature({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: totalAmount,
            });

            if (verifyResponse.success) {
              // Place Order
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

              toast.success(`Payment successful and order executed`);
              setRecentTrades((current) => [executedTrade, ...current].slice(0, 5));
            } else {
              toast.error('Payment verification failed. Order not placed.');
            }
          } catch (error) {
            toast.error(error?.response?.data?.message || 'Payment verification error');
          }
        },
        theme: {
          color: '#0ea5e9'
        }
      };

      const rzp = new window.Razorpay(orderOptions);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed. Order not placed.');
      });
      rzp.open();

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Order submission failed');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Trading</h1>
        <p className="mt-2 text-slate-400">Create orders, view live price action, and manage positions.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-xl font-semibold text-white">Order ticket</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <label className="block text-sm text-slate-400">
              Asset
              <select
                {...register('assetId', { required: 'Select an asset' })}
                className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
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
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </label>
              <label className="block text-sm text-slate-400">
                Type
                <select
                  {...register('orderType')}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
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
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
                />
              </label>
              <label className="block text-sm text-slate-400">
                Limit price
                <input
                  type="number"
                  step="0.01"
                  {...register('price')}
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
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

        <div className="space-y-4">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Live market feed</h2>
            <div className="mt-4 space-y-3">
              {liveFeed.length === 0 ? (
                <p className="text-slate-400">Listening for real-time market events...</p>
              ) : (
                liveFeed.map((update, index) => (
                  <div key={`${update.symbol}-${index}`} className="rounded-3xl bg-slate-900 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">{update.symbol}</p>
                        <p className="mt-1 text-lg font-semibold text-white">${update.price?.toFixed(2)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs ${update.change >= 0 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                        {update.change >= 0 ? '+' : ''}{update.change?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Recent trades</h2>
            <div className="mt-4 space-y-3">
              {recentTrades.length === 0 ? (
                <p className="text-slate-400">No recent trades available.</p>
              ) : (
                recentTrades.map((trade) => (
                  <div key={trade._id} className="rounded-3xl bg-slate-900 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">{trade.asset?.symbol || trade.asset}</p>
                        <p className="mt-1 text-lg font-semibold text-white">{trade.side?.toUpperCase()} {trade.quantity}@${trade.price?.toFixed(2)}</p>
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
