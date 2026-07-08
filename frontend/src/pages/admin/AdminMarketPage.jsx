import React, { useState, useEffect } from "react";
import { Activity, Play, Pause, AlertTriangle } from "lucide-react";
import { getSettings, updateMarketStatus } from "../../services/adminService";

const AdminMarketPage = () => {
  const [marketStatus, setMarketStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await getSettings(token);
        if (res.success && res.data) {
          setMarketStatus(res.data.marketStatus || "open");
        }
      } catch (error) {
        console.error("Failed to fetch market status", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === marketStatus) return;
    if (!window.confirm(`Are you sure you want to change the market status to ${newStatus.toUpperCase()}?`)) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await updateMarketStatus(newStatus, token);
      if (res.success) {
        setMarketStatus(newStatus);
      }
    } catch (error) {
      console.error("Failed to update market status", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Global Market Controls</h1>
        <p className="text-gray-400 text-sm mt-1">Control trading availability across the entire platform.</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8">
        
        {loading ? (
          <div className="text-center p-8 text-gray-500">Loading system configuration...</div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-400" />
                  Current Status
                </h3>
                <p className="text-gray-400 text-sm">
                  This determines whether users can place new trades.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className={`px-6 py-3 rounded-xl border font-bold text-lg tracking-wide ${
                  marketStatus === "open" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : marketStatus === "maintenance"
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                }`}>
                  {marketStatus.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => handleStatusChange("open")}
                disabled={processing || marketStatus === "open"}
                className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                  marketStatus === "open"
                    ? "bg-emerald-500/20 border-emerald-500/50 cursor-default"
                    : "bg-gray-900 border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 cursor-pointer"
                }`}
              >
                <div className={`p-3 rounded-full ${marketStatus === "open" ? "bg-emerald-500 text-white" : "bg-gray-800 text-emerald-500"}`}>
                  <Play size={24} />
                </div>
                <span className={`font-semibold ${marketStatus === "open" ? "text-emerald-400" : "text-gray-300"}`}>Open Market</span>
              </button>

              <button 
                onClick={() => handleStatusChange("maintenance")}
                disabled={processing || marketStatus === "maintenance"}
                className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                  marketStatus === "maintenance"
                    ? "bg-amber-500/20 border-amber-500/50 cursor-default"
                    : "bg-gray-900 border-gray-700 hover:border-amber-500/50 hover:bg-amber-500/10 cursor-pointer"
                }`}
              >
                <div className={`p-3 rounded-full ${marketStatus === "maintenance" ? "bg-amber-500 text-white" : "bg-gray-800 text-amber-500"}`}>
                  <AlertTriangle size={24} />
                </div>
                <span className={`font-semibold ${marketStatus === "maintenance" ? "text-amber-400" : "text-gray-300"}`}>Maintenance</span>
              </button>

              <button 
                onClick={() => handleStatusChange("closed")}
                disabled={processing || marketStatus === "closed"}
                className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all ${
                  marketStatus === "closed"
                    ? "bg-rose-500/20 border-rose-500/50 cursor-default"
                    : "bg-gray-900 border-gray-700 hover:border-rose-500/50 hover:bg-rose-500/10 cursor-pointer"
                }`}
              >
                <div className={`p-3 rounded-full ${marketStatus === "closed" ? "bg-rose-500 text-white" : "bg-gray-800 text-rose-500"}`}>
                  <Pause size={24} />
                </div>
                <span className={`font-semibold ${marketStatus === "closed" ? "text-rose-400" : "text-gray-300"}`}>Close Market</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMarketPage;
