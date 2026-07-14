import React, { useState, useEffect } from "react";
import { 
  Users, Briefcase, ArrowRightLeft, DollarSign, Activity, Wallet, Shield, ChevronRight, 
  ShoppingCart, RefreshCw, AlertCircle, UserCheck, UserX, BarChart3, TrendingUp, TrendingDown
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { getDashboardStats, getAnalytics } from "../../services/adminService";
import StatCard from "../../components/admin/StatCard";

const COLORS = ["#6366f1", "#10b981", "#f43f5e", "#f59e0b"];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const [statsRes, analyticsRes] = await Promise.all([
          getDashboardStats(token),
          getAnalytics(token)
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (analyticsRes.success) setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">System Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time overview of platform health and metrics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            Download Report
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.users?.total || 0} icon={<Users size={20} />} trend="up" trendValue={12} color="indigo" />
        <StatCard title="Active Users" value={stats?.users?.active || 0} icon={<UserCheck size={20} />} trend="up" trendValue={8} color="emerald" />
        <StatCard title="Verified Users" value={stats?.users?.verified || 0} icon={<Shield size={20} />} trend="up" trendValue={15} color="blue" />
        <StatCard title="Suspended Users" value={stats?.users?.suspended || 0} icon={<UserX size={20} />} trend="down" trendValue={2} color="rose" />
        
        <StatCard title="Total Assets" value={stats?.assets?.total || 0} icon={<Briefcase size={20} />} trend="up" trendValue={3} color="purple" />
        <StatCard title="Trading Enabled" value={stats?.assets?.active || 0} icon={<Activity size={20} />} trend="up" trendValue={5} color="emerald" />
        <StatCard title="Total Orders" value={stats?.orders?.total || 0} icon={<ShoppingCart size={20} />} trend="up" trendValue={28} color="amber" />
        <StatCard title="Today's Trades" value={stats?.orders?.todaysTrades || 0} icon={<ArrowRightLeft size={20} />} trend="up" trendValue={45} color="teal" />
        
        <StatCard title="Trading Volume" value={`₹${((stats?.financials?.totalTradingVolume || 0) / 1000000).toFixed(2)}M`} icon={<BarChart3 size={20} />} trend="up" trendValue={24} color="indigo" />
        <StatCard title="Exchange Revenue" value={`₹${((stats?.financials?.exchangeRevenue || 0) / 1000).toFixed(1)}k`} icon={<DollarSign size={20} />} trend="up" trendValue={18} color="emerald" />
        <StatCard title="Platform Profit" value={`₹${((stats?.financials?.platformProfit || 0) / 1000).toFixed(1)}k`} icon={<TrendingUp size={20} />} trend="up" trendValue={14} color="blue" />
        <StatCard title="Open Issues" value={stats?.financials?.openIssues || 0} icon={<AlertCircle size={20} />} trend="up" trendValue={5} color="rose" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Trading Volume & Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-white">Daily Trading Volume & Users</h3>
            <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[250px] sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.dailyTrades || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#fff' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                <Area yAxisId="right" type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-white">Monthly Revenue Trend</h3>
            <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none">
              <option>2025</option>
              <option>2024</option>
            </select>
          </div>
          <div className="h-[250px] sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.revenueTrend || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#fff' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Asset Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-6">Asset Distribution</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.assetDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {analytics?.assetDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2 flex-wrap">
            {analytics?.assetDistribution?.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Assets */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-4">Market Movers</h3>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Top Performers</p>
              <div className="space-y-3">
                {stats?.topAssets?.map((asset, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50">
                    <span className="font-medium text-slate-200">{asset.symbol}</span>
                    <span className="text-emerald-400 text-sm font-medium flex items-center">
                      <TrendingUp size={14} className="mr-1" /> {asset.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Top Losers</p>
              <div className="space-y-3">
                {stats?.losingAssets?.map((asset, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-800/50">
                    <span className="font-medium text-slate-200">{asset.symbol}</span>
                    <span className="text-rose-400 text-sm font-medium flex items-center">
                      <TrendingDown size={14} className="mr-1" /> {asset.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Traders */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-4">Top Traders</h3>
          <div className="space-y-4">
            {stats?.topTraders?.map((trader, i) => (
              <div key={i} className="flex items-center gap-3 p-2 border-b border-slate-800 last:border-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                  {i+1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{trader.name}</p>
                  <p className="text-xs text-slate-500">Vol: ₹{(trader.volume/1000).toFixed(0)}k</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-400">+${(trader.profit/1000).toFixed(1)}k</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Transactions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-white">Recent Transactions</h3>
            <button className="text-indigo-400 text-sm hover:text-indigo-300 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {stats?.recentTransactions?.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <div className="font-medium text-slate-300 text-sm">{tx.user?.name || "Unknown"}</div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${tx.type === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-sm">₹{tx.total?.toLocaleString() || "0"}</td>
                    <td className="py-3 text-right">
                      <span className="text-emerald-400 text-xs">Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-white">Recent Registrations</h3>
            <button className="text-indigo-400 text-sm hover:text-indigo-300 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {stats?.recentRegistrations?.map((user, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <div className="font-medium text-slate-300 text-sm">{user.name}</div>
                    </td>
                    <td className="py-3 text-slate-400 text-sm truncate max-w-[150px]">{user.email}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${user.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
