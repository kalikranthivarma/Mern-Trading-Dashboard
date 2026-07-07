const DashboardCard = ({ title, value, trend, icon, description }) => (
  <div className="glass-card p-5 rounded-3xl border border-white/10 shadow-glass">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      </div>
      <div className="text-sky-400">{icon}</div>
    </div>
    <p className="mt-4 text-sm text-slate-400">{description} · {trend}</p>
  </div>
);

export default DashboardCard;
