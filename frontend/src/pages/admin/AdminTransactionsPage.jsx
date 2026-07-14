import React, { useState, useEffect } from "react";
import { Search, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { getTransactions } from "../../services/adminService";

const AdminTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await getTransactions(token);
      if (res.success) setTransactions(res.data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => 
    tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    if (!transactions.length) return;
    const headers = ["ID,Date,Transaction ID,User,Type,Amount,Status\n"];
    const csvData = transactions.map(tx => 
      `${tx._id},${new Date(tx.createdAt).toLocaleDateString()},${tx.razorpayPaymentId},${tx.user?.email || 'N/A'},Deposit,${tx.amount},${tx.status}`
    ).join("\n");
    
    const blob = new Blob([headers + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_export_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Transactions Ledger</h1>
          <p className="text-gray-400 text-sm mt-1">View all deposits, withdrawals, and internal transfers.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          Export Transactions
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-700/50 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by user email or transaction ID..." 
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
                <th className="p-4 font-medium">Transaction ID</th>
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">Loading transactions...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">No transactions found.</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="p-4 text-sm text-gray-300">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-400">
                      {tx.razorpayPaymentId}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white text-sm">{tx.user?.name || "Unknown"}</span>
                        <span className="text-gray-500 text-xs">{tx.user?.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                          <ArrowDownRight size={16} />
                        </div>
                        <span className="text-sm text-gray-300">DEPOSIT</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">₹{tx.amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                        tx.status === "Success" ? "bg-emerald-500/10 text-emerald-400" : 
                        tx.status === "Pending" ? "bg-amber-500/10 text-amber-400" : 
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        {tx.status}
                      </span>
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

export default AdminTransactionsPage;
