import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { SMA, RSI, MACD } from 'technicalindicators';

const TradingChart = ({ data, theme = 'dark', symbol }) => {
  const chartContainerRef = useRef(null);
  const [showSMA, setShowSMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  
  // Using some mock data if empty
  const chartData = data && data.length > 0 ? data : [
    { time: '2023-10-01', open: 150.12, high: 155.30, low: 149.00, close: 154.50 },
    { time: '2023-10-02', open: 154.50, high: 156.00, low: 152.00, close: 153.20 },
    { time: '2023-10-03', open: 153.20, high: 157.50, low: 151.10, close: 156.80 },
    { time: '2023-10-04', open: 156.80, high: 160.00, low: 155.00, close: 159.20 },
    { time: '2023-10-05', open: 159.20, high: 162.50, low: 158.00, close: 161.40 },
    { time: '2023-10-06', open: 161.40, high: 163.00, low: 159.50, close: 160.10 },
    { time: '2023-10-07', open: 160.10, high: 161.00, low: 157.00, close: 158.50 },
    { time: '2023-10-08', open: 158.50, high: 164.50, low: 157.50, close: 163.80 },
    { time: '2023-10-09', open: 163.80, high: 168.00, low: 162.00, close: 167.50 },
    { time: '2023-10-10', open: 167.50, high: 169.50, low: 165.00, close: 168.20 },
    { time: '2023-10-11', open: 168.20, high: 172.00, low: 166.00, close: 171.50 },
    { time: '2023-10-12', open: 171.50, high: 175.50, low: 170.10, close: 174.80 },
    { time: '2023-10-13', open: 174.80, high: 176.00, low: 171.00, close: 172.20 },
    { time: '2023-10-14', open: 172.20, high: 174.50, low: 168.50, close: 169.10 },
    { time: '2023-10-15', open: 169.10, high: 171.00, low: 165.00, close: 166.50 },
  ];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isDark = theme === 'dark';
    
    // Create the chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? 'transparent' : '#ffffff' },
        textColor: isDark ? '#94a3b8' : '#334155',
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0' },
        horzLines: { color: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          color: isDark ? '#cbd5e1' : '#475569',
          width: 1,
          style: 1,
        },
        horzLine: {
          color: isDark ? '#cbd5e1' : '#475569',
          width: 1,
          style: 1,
        },
      },
      timeScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
      },
      leftPriceScale: {
        visible: showRSI,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
      },
      height: 400,
    });

    // 1. MAIN CANDLESTICK SERIES
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });
    candlestickSeries.setData(chartData);

    const closePrices = chartData.map(d => d.close);

    // 2. SMA (Simple Moving Average - 5 period for demo due to small data)
    if (showSMA && closePrices.length >= 5) {
      const smaData = SMA.calculate({ period: 5, values: closePrices });
      const smaSeriesData = chartData.slice(4).map((d, i) => ({
        time: d.time,
        value: smaData[i]
      }));
      
      const smaSeries = chart.addSeries(LineSeries, {
        color: '#38bdf8',
        lineWidth: 2,
        priceScaleId: 'right', // Same scale as candlesticks
      });
      smaSeries.setData(smaSeriesData);
    }

    // 3. RSI (Relative Strength Index - 14 period usually, 5 for demo)
    if (showRSI && closePrices.length >= 6) {
      const rsiData = RSI.calculate({ period: 5, values: closePrices });
      const rsiSeriesData = chartData.slice(5).map((d, i) => ({
        time: d.time,
        value: rsiData[i]
      }));

      const rsiSeries = chart.addSeries(LineSeries, {
        color: '#c084fc',
        lineWidth: 2,
        priceScaleId: 'left', // Render on left scale (0 to 100 usually)
      });
      rsiSeries.setData(rsiSeriesData);
    }

    // Handle resize
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, theme, showSMA, showRSI]);

  return (
    <div className="w-full relative space-y-4">
      {/* Chart Toolbar */}
      <div className="flex gap-2 p-2 bg-white/5 rounded-xl border border-white/10 w-fit">
        <button 
          onClick={() => setShowSMA(!showSMA)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            showSMA ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-white/10'
          }`}
        >
          SMA (Moving Average)
        </button>
        <button 
          onClick={() => setShowRSI(!showRSI)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            showRSI ? 'bg-purple-500 text-white' : 'text-slate-400 hover:bg-white/10'
          }`}
        >
          RSI (Relative Strength)
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="relative">
        <div className="absolute top-4 left-4 z-10 font-bold text-xl opacity-20 pointer-events-none">
          {symbol || 'MARKET CHART'}
        </div>
        <div ref={chartContainerRef} className="w-full rounded-2xl overflow-hidden border border-white/5 bg-slate-900/50" />
      </div>
    </div>
  );
};

export default TradingChart;
