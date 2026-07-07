import { useEffect, useState } from 'react';
import { getTradeHistory } from '../services/tradingService';
import { FileText, Clock, CheckCircle2 } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'trades'

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const tradesData = await getTradeHistory();
        const tradesList = tradesData.data || tradesData.history || tradesData || [];
        setOrders(tradesList);
        setTrades(tradesList);
      } catch (error) {
        console.error('Failed to load orders/trades:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrderData();
  }, []);

  const totalCount = orders.length;
  const executedCount = orders.length; // All trades are executed in real-time
  const pendingCount = 0;
  const cancelledCount = 0;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Orders & Executions</h1>
        <p className="mt-2 text-slate-400">Review your open orders, pending requests, and complete trade executions history.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-400 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Order Metrics Card */}
          <div className="glass-card rounded-3xl p-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-900/50 p-5 border border-white/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Placed</p>
                <p className="mt-3 text-3xl font-bold text-white">{totalCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/50 p-5 border border-white/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</p>
                <p className="mt-3 text-3xl font-bold text-amber-400">{pendingCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/50 p-5 border border-white/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed</p>
                <p className="mt-3 text-3xl font-bold text-emerald-400">{executedCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-900/50 p-5 border border-white/5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cancelled</p>
                <p className="mt-3 text-3xl font-bold text-rose-500">{cancelledCount}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 text-sm font-semibold transition relative ${
                activeTab === 'orders' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Order Tickets ({orders.length})
              {activeTab === 'orders' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`pb-4 text-sm font-semibold transition relative ${
                activeTab === 'trades' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Execution History ({trades.length})
              {activeTab === 'trades' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Content Lists */}
          <div className="glass-card rounded-3xl p-6 overflow-hidden">
            {activeTab === 'orders' ? (
              orders.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-2xl">
                  <FileText className="h-10 w-10 text-slate-600 mb-2" />
                  <p className="text-slate-400">No placed orders found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Side</th>
                        <th className="py-3 px-4">Asset</th>
                        <th className="py-3 px-4 text-right">Quantity</th>
                        <th className="py-3 px-4 text-right">Price</th>
                        <th className="py-3 px-4 text-right">Total Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Placed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((order) => {
                        const isBuy = order.tradeType === 'BUY';
                        return (
                          <tr key={order._id} className="hover:bg-white/5 transition">
                            <td className="py-4 px-4 font-semibold">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                }`}
                              >
                                {order.tradeType}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-semibold text-white">
                              {order.asset?.symbol || 'Asset'}
                            </td>
                            <td className="py-4 px-4 text-right font-medium">{order.quantity}</td>
                            <td className="py-4 px-4 text-right font-medium">
                              ${order.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-slate-200">
                              ${order.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 text-xs font-semibold">
                                <CheckCircle2 className="h-3 w-3" /> executed
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right text-xs text-slate-500">
                              {new Date(order.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : trades.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-2xl">
                <FileText className="h-10 w-10 text-slate-600 mb-2" />
                <p className="text-slate-400">No executed trades in history.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Side</th>
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4 text-right">Quantity</th>
                      <th className="py-3 px-4 text-right">Execution Price</th>
                      <th className="py-3 px-4 text-right">Total Amount</th>
                      <th className="py-3 px-4 text-right">Executed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {trades.map((trade) => {
                      const isBuy = trade.tradeType === 'BUY';
                      return (
                        <tr key={trade._id} className="hover:bg-white/5 transition">
                          <td className="py-4 px-4 font-semibold">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {trade.tradeType}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-semibold text-white">{trade.asset?.symbol || 'Asset'}</p>
                              <p className="text-xs text-slate-500">{trade.asset?.name || ''}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-medium">{trade.quantity}</td>
                          <td className="py-4 px-4 text-right font-medium">
                            ${trade.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-slate-200">
                            ${trade.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-4 text-right text-xs text-slate-500">
                            {new Date(trade.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default OrdersPage;
