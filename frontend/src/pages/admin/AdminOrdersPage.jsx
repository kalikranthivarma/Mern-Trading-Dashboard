import React, { useState, useEffect } from "react";
import { Search, Filter, Ban, CheckCircle } from "lucide-react";
import { getOrders, cancelOrder } from "../../services/adminService";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await getOrders(token);
      if (res.success) setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    toast?.error("Trades are executed immediately and cannot be cancelled");
  };

  const filteredOrders = orders.filter(order => 
    order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.asset?.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Order Management</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor and manage user trading orders.</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-700/50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by user email or asset symbol..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Asset</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-700/20 transition-colors group">
                    <td className="p-4 text-sm text-gray-300">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white text-sm">{order.user?.name || "Unknown"}</span>
                        <span className="text-gray-500 text-xs">{order.user?.email}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-white">
                      {order.asset?.symbol || "Unknown"}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${order.tradeType === "BUY" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                        {order.tradeType}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white text-sm">{order.quantity} units</span>
                        <span className="text-gray-500 text-xs">@ ₹{order.price}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400">
                        EXECUTED
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {/* Actions disabled for executed trades */}
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

export default AdminOrdersPage;
