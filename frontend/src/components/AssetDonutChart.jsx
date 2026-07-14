import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

const AssetDonutChart = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: '12px',
              color: '#f8fafc'
            }} 
            itemStyle={{ color: '#f8fafc' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetDonutChart;
