import { useEffect, useState } from 'react';
import { getWithdrawals, processWithdrawal } from '../../services/adminService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Clock, CheckCircle2, XCircle, Search, Banknote } from 'lucide-react';

const AdminWithdrawalsPage = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const data = await getWithdrawals(token);
      if (data.success) {
        setWithdrawals(data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleAction = async (id, action) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${action} this withdrawal?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0ea5e9', // sky-500
      cancelButtonColor: '#334155', // slate-700
      confirmButtonText: 'Yes, proceed',
      background: '#0f172a', // slate-950
      color: '#f8fafc' // slate-50
    });
    if (!result.isConfirmed) return;

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("adminToken");
      const remarks = `Processed by Admin on ${new Date().toLocaleDateString()}`;
      const data = await processWithdrawal(id, action, remarks, token);
      if (data.success) {
        toast.success(`Withdrawal successfully ${action}d`);
        fetchWithdrawals(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to ${action} withdrawal`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'Pending':
      case 'Processing': return <Clock className="h-4 w-4 text-amber-400" />;
      case 'Rejected':
      case 'Failed': return <XCircle className="h-4 w-4 text-rose-500" />;
      default: return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400';
      case 'Pending':
      case 'Processing': return 'bg-amber-500/10 text-amber-400';
      case 'Rejected':
      case 'Failed': return 'bg-rose-500/10 text-rose-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    w.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdrawal Management</h1>
          <p className="mt-1 text-sm text-slate-400">Review and process user fiat withdrawal requests</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ID, name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-white/10 bg-slate-900 py-2 pl-10 pr-4 text-sm text-white focus:border-sky-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 sm:p-6">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading withdrawal requests...</div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-2xl">
              No withdrawal requests found.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-300 min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Fees</th>
                  <th className="py-3 px-4 text-right">Net Payout</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredWithdrawals.map((item) => {
                  const totalFees = item.platformFee + item.processingFee + item.gst;
                  const isPending = item.status === 'Pending' || item.status === 'Processing';

                  return (
                    <tr key={item._id} className="hover:bg-white/5 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white uppercase overflow-hidden">
                            {item.user?.profileImage ? (
                              <img src={item.user.profileImage} alt="" className="h-full w-full object-cover" />
                            ) : (
                              item.user?.name?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.user?.name}</p>
                            <p className="text-xs text-slate-500">{item.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-white text-xs">{item.method}</p>
                          <p className="text-xs text-slate-500 mt-0.5 max-w-[150px] truncate" title={item.method === 'Bank Transfer' ? `Bank: ${item.bankDetails?.bankName} | A/C: ${item.bankDetails?.accountNumber} | IFSC: ${item.bankDetails?.ifscCode}` : `UPI: ${item.bankDetails?.upiId}`}>
                            {item.method === 'Bank Transfer' ? `${item.bankDetails?.bankName} - ${item.bankDetails?.accountNumber}` : item.bankDetails?.upiId}
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">{item.referenceNumber}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-medium">₹{item.amount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-xs text-rose-400">-₹{totalFees.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-sky-400">₹{item.netAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}>
                          {getStatusIcon(item.status)} {item.status}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleAction(item._id, 'approve')}
                              disabled={isProcessing}
                              className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(item._id, 'reject')}
                              disabled={isProcessing}
                              className="rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawalsPage;
