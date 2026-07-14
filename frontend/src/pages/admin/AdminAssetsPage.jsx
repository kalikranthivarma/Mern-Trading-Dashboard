import React, { useState, useEffect } from "react";
import { Search, Filter, Edit2, Trash2, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { getAssets } from "../../services/adminService"; // I need to add createAsset, updateAsset, deleteAsset to adminService!
import axios from "axios";
import Swal from 'sweetalert2';

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/admin` : "http://localhost:5000/api/admin",
  withCredentials: true,
});

const AdminAssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await getAssets(token);
      if (res.success) setAssets(res.data);
    } catch (error) {
      console.error("Failed to fetch assets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Asset?',
      text: 'Are you sure you want to delete this asset?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48', // rose-600
      cancelButtonColor: '#334155', // slate-700
      confirmButtonText: 'Yes, delete it!',
      background: '#0f172a', // slate-950
      color: '#f8fafc' // slate-50
    });
    if (!result.isConfirmed) return;
    try {
      const token = localStorage.getItem("adminToken");
      await adminApi.delete(`/assets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAssets();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Asset Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage tradable cryptocurrencies and stocks.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-700/50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search assets by symbol or name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Asset</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">Loading assets...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">No assets found.</td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-gray-700/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                          {asset.iconUrl ? (
                            <img src={asset.iconUrl} alt={asset.symbol} className="w-6 h-6 object-contain" />
                          ) : (
                            <span className="font-bold text-slate-300">{asset.symbol.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{asset.symbol}</p>
                          <p className="text-sm text-gray-400">{asset.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white">₹{asset.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-medium px-2 py-1 bg-slate-700 text-slate-300 rounded-md">
                        {asset.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" onClick={() => handleDelete(asset._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAssetsPage;
