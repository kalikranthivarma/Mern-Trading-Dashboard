import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { TrendingUp, Shield, Zap, Globe, ArrowRight, BarChart3, LineChart } from 'lucide-react';

const LandingPage = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-sky-400" />
          <span className="text-xl font-bold tracking-tight text-white font-serif">TradePulse</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-sm font-semibold text-white transition shadow-lg shadow-sky-500/20"
            >
              Go to Console <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-white/10 hover:bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition border border-white/10"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/5 px-4 py-1.5 text-xs font-semibold text-sky-400 mb-6">
          <Zap className="h-3.5 w-3.5 fill-sky-400" />
          High-Frequency Institutional Trading Console
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-serif max-w-4xl leading-tight">
          Where Speed Meets <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Financial Intelligence</span>
        </h1>

        <p className="mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          Execute multi-asset trades, track live positions, monitor compliance limits, and view market actions in real-time on our sub-millisecond execution engine.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 px-8 py-4 text-base font-semibold text-white transition shadow-xl shadow-sky-500/25"
            >
              Open Trading Terminal <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 hover:bg-sky-400 px-8 py-4 text-base font-semibold text-white transition shadow-xl shadow-sky-500/25"
              >
                Start Trading Now <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 border border-white/10 hover:bg-slate-800 px-8 py-4 text-base font-semibold text-white transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:border-sky-500/30 transition duration-300">
            <div className="rounded-2xl bg-sky-500/10 p-3 w-fit text-sky-400 mb-6">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Ultra-Low Latency</h3>
            <p className="text-slate-400 leading-relaxed">
              Order submission and market updates sync instantly with native WebSockets.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:border-sky-500/30 transition duration-300">
            <div className="rounded-2xl bg-indigo-500/10 p-3 w-fit text-indigo-400 mb-6">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Compliance Ready</h3>
            <p className="text-slate-400 leading-relaxed">
              Automated limit checking, audit trail reporting, and secure tokenized authentication.
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 border border-white/5 bg-slate-900/40 relative overflow-hidden group hover:border-sky-500/30 transition duration-300">
            <div className="rounded-2xl bg-purple-500/10 p-3 w-fit text-purple-400 mb-6">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Multi-Asset Trading</h3>
            <p className="text-slate-400 leading-relaxed">
              Seamlessly swap and trade Stocks, Cryptocurrencies, and Forex instruments in one view.
            </p>
          </div>
        </div>
      </section>

      {/* Decorative Image/Mockup Section */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="rounded-[40px] border border-white/10 bg-slate-900/50 p-4 relative overflow-hidden shadow-2xl shadow-sky-500/5">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none" />
          <div className="rounded-[32px] overflow-hidden border border-white/5 bg-slate-950 p-8 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-md">
              <h2 className="text-3xl font-bold text-white font-serif">
                Enterprise Terminal Experience
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Designed for traders who require clarity. Get clean visual charts, custom progress bars for asset allocations, and responsive position books.
              </p>
              <div className="flex gap-8">
                <div>
                  <p className="text-3xl font-bold text-white">0ms</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">WebSocket Delay</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">99.9%</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Engine Uptime</p>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Live Active Instruments</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 animate-pulse font-mono">● Simulator Connected</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm py-1 border-b border-white/5">
                  <span className="font-semibold text-white">AAPL (Apple Inc.)</span>
                  <span className="font-mono text-slate-300 font-semibold">₹182.50</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-white/5">
                  <span className="font-semibold text-white">BTC (Bitcoin)</span>
                  <span className="font-mono text-slate-300 font-semibold">₹62,450.00</span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="font-semibold text-white">TSLA (Tesla Inc.)</span>
                  <span className="font-mono text-slate-300 font-semibold">₹174.60</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
