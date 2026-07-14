import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Server, Shield, Globe } from "lucide-react";
import { getSettings } from "../../services/adminService";

const AdminSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    siteName: "Terminal Trading",
    supportEmail: "support@terminal.io",
    maintenanceMode: false,
    requireEmailVerification: true,
    twoFactorAuth: false,
    tradingFeePercentage: "0.1",
    withdrawalFeeFixed: "5.00"
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        // We only have marketStatus in db currently, so we'll mock the rest for UI
        const res = await getSettings(token);
        if (res.success && res.data) {
          setSettings(prev => ({
            ...prev,
            maintenanceMode: res.data.marketStatus === "maintenance",
            tradingFeePercentage: res.data.tradingFeePercent || "0.1",
            withdrawalFeeFixed: res.data.withdrawalFeeFlat || "5.00"
          }));
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tradingFeePercent: Number(settings.tradingFeePercentage),
          withdrawalFeeFlat: Number(settings.withdrawalFeeFixed)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Settings saved successfully!");
      } else {
        alert(data.message || "Failed to save settings");
      }
    } catch (error) {
      console.error(error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400 p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Configure global platform parameters and rules.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Nav */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-left font-medium transition-colors">
            <Globe size={18} />
            General Config
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-xl text-left font-medium transition-colors">
            <Shield size={18} />
            Security Rules
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-gray-800/50 hover:text-white rounded-xl text-left font-medium transition-colors">
            <Server size={18} />
            Trading Parameters
          </button>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-4">General Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Platform Name</label>
                <input 
                  type="text" 
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Support Email</label>
                <input 
                  type="email" 
                  name="supportEmail"
                  value={settings.supportEmail}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-700/50">
              <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Features</h4>
              
              <label className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors">
                <div>
                  <p className="font-medium text-white">Require Email Verification</p>
                  <p className="text-sm text-gray-500">Users must verify their email before trading.</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
                  <input type="checkbox" name="requireEmailVerification" checked={settings.requireEmailVerification} onChange={handleChange} className="peer sr-only" />
                  <span className="absolute inset-y-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-7 peer-checked:bg-indigo-500"></span>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-800 cursor-pointer hover:border-gray-700 transition-colors">
                <div>
                  <p className="font-medium text-white">Enforce 2FA</p>
                  <p className="text-sm text-gray-500">Require Two-Factor Authentication for all admins.</p>
                </div>
                <div className="relative inline-block w-12 h-6 rounded-full bg-gray-700">
                  <input type="checkbox" name="twoFactorAuth" checked={settings.twoFactorAuth} onChange={handleChange} className="peer sr-only" />
                  <span className="absolute inset-y-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-7 peer-checked:bg-indigo-500"></span>
                </div>
              </label>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-4">Financial Parameters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Default Trading Fee (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="tradingFeePercentage"
                    step="0.01"
                    value={settings.tradingFeePercentage}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-4 pr-10 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Fiat Withdrawal Fee ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input 
                    type="number" 
                    name="withdrawalFeeFixed"
                    step="0.10"
                    value={settings.withdrawalFeeFixed}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-8 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
