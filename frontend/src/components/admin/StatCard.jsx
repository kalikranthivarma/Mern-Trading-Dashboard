import React from "react";

const StatCard = ({ title, value, icon, trend, trendValue, color = "indigo" }) => {
  const isPositive = trend === "up";
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/80 hover:border-gray-600/50 transition-all duration-300 group cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">
            {value}
          </h3>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-400 group-hover:scale-110 group-hover:bg-${color}-500/20 transition-all duration-300`}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center text-sm">
          <span 
            className={`flex items-center font-medium ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? "+" : "-"}{Math.abs(trendValue)}%
          </span>
          <span className="text-gray-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
