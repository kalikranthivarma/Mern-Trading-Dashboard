import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const PriceAlertsCard = ({ marketUpdates }) => {
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('priceAlerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [symbol, setSymbol] = useState('BTC');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('above');

  // Save to local storage whenever alerts change
  useEffect(() => {
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // Check alerts against real-time market updates
  useEffect(() => {
    if (!marketUpdates || marketUpdates.length === 0) return;
    
    marketUpdates.forEach(update => {
      alerts.forEach(alert => {
        if (!alert.active || alert.symbol !== update.symbol) return;

        let triggered = false;
        if (alert.condition === 'above' && update.price >= alert.targetPrice) {
          triggered = true;
        } else if (alert.condition === 'below' && update.price <= alert.targetPrice) {
          triggered = true;
        }

        if (triggered) {
          toast(`🚨 Price Alert: ${alert.symbol} is ${alert.condition} ₹${alert.targetPrice}!`, {
            icon: '🔔',
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
            duration: 8000
          });
          
          // Disable alert after triggering
          setAlerts(prev => prev.map(a => 
            a.id === alert.id ? { ...a, active: false } : a
          ));
        }
      });
    });
  }, [marketUpdates, alerts]);

  const addAlert = (e) => {
    e.preventDefault();
    if (!targetPrice || isNaN(targetPrice)) {
      toast.error('Please enter a valid target price');
      return;
    }
    const newAlert = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      targetPrice: parseFloat(targetPrice),
      condition,
      active: true,
      createdAt: new Date().toISOString()
    };
    setAlerts([newAlert, ...alerts]);
    setTargetPrice('');
    toast.success('Price alert set successfully!');
  };

  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400">
          <Bell size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Price Alerts</h3>
          <p className="text-xs text-slate-400">Get notified on price targets</p>
        </div>
      </div>

      <form onSubmit={addAlert} className="flex flex-col gap-3 mb-6">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Asset (e.g. BTC)" 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-1/3 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500 uppercase"
            required
          />
          <select 
            value={condition} 
            onChange={(e) => setCondition(e.target.value)}
            className="w-1/3 bg-slate-900 border border-white/10 rounded-xl px-2 py-2 text-sm text-white focus:outline-none"
          >
            <option value="above">Above &gt;</option>
            <option value="below">Below &lt;</option>
          </select>
          <div className="relative w-1/3">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
            <input 
              type="number" 
              step="0.01"
              placeholder="Price" 
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl pl-6 pr-2 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>
        </div>
        <button 
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-white/5"
        >
          <Plus size={16} /> Add Alert
        </button>
      </form>

      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
        {alerts.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">No active alerts</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-white/5">
              <div>
                <p className="text-sm font-medium text-white">
                  {alert.symbol} {alert.condition === 'above' ? '≥' : '≤'} ₹{alert.targetPrice}
                </p>
                <p className="text-xs text-slate-500">
                  {alert.active ? (
                    <span className="text-emerald-400">Active</span>
                  ) : (
                    <span className="text-slate-500">Triggered</span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => removeAlert(alert.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Remove alert"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PriceAlertsCard;
