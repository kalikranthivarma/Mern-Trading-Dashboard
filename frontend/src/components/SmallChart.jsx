import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';

const SmallChart = ({ data }) => (
  <div className="h-44 w-full glass-card rounded-3xl p-4">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.7} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis hide />
        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(148,163,184,0.12)' }} />
        <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="url(#lineGradient)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default SmallChart;
