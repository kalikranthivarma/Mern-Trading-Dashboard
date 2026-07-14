import { useEffect, useState } from 'react';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import WithdrawalModal from '../components/wallet/WithdrawalModal';
import DepositModal from '../components/wallet/DepositModal';
import { updateProfile } from '../redux/slices/authSlice';
import api from '../services/api';

const WalletPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const dispatch = useDispatch();

  const fetchWithdrawals = async () => {
    try {
      const { data } = await api.get('/withdrawals/my-withdrawals');
      if (data.success) {
        setWithdrawals(data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    try {
      const { data } = await api.get('/users/me');
      if (data.success && data.data && data.data.user) {
        dispatch(updateProfile(data.data.user)); 
      }
    } catch (error) {
      console.error("Failed to refresh wallet balance", error);
    }
    fetchWithdrawals();
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'Pending':
      case 'Processing': return <Clock className="h-5 w-5 text-amber-400" />;
      case 'Rejected':
      case 'Failed': return <XCircle className="h-5 w-5 text-rose-500" />;
      default: return <Clock className="h-5 w-5 text-slate-400" />;
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

  const pendingAmount = withdrawals
    .filter(w => w.status === 'Pending' || w.status === 'Processing')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const availableBalance = user?.availableBalance || 0;
  const lockedBalance = user?.lockedBalance || 0;
  const totalBalance = availableBalance + lockedBalance;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">Wallet & Funds</h1>
        <p className="mt-2 text-slate-400">Manage your fiat balances, deposits, and withdrawals.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="glass-card rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm font-semibold uppercase tracking-wider">Total Balance</span>
              <Wallet className="h-5 w-5 text-sky-400" />
            </div>
            <p className="mt-4 text-3xl sm:text-4xl font-bold">
              ₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <p className="mt-4 text-xs text-slate-500">Available + Locked</p>
        </div>

        {/* Available Balance */}
        <div className="glass-card rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm font-semibold uppercase tracking-wider">Available Balance</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="mt-4 text-3xl sm:text-4xl font-bold text-emerald-500">
              ₹{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <p className="mt-4 text-xs text-slate-500">Funds ready for trading or withdrawal</p>
        </div>

        {/* Locked Balance */}
        <div className="glass-card rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-sm font-semibold uppercase tracking-wider">Locked Balance</span>
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <p className="mt-4 text-3xl sm:text-4xl font-bold text-amber-500">
              ₹{lockedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <p className="mt-4 text-xs text-slate-500">Funds reserved for pending orders</p>
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-3xl p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-4">
            <span className="text-sm font-semibold uppercase tracking-wider">Quick Actions</span>
          </div>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-400"
            >
              <ArrowDownToLine className="h-4 w-4" /> Deposit Funds
            </button>
            <button 
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <ArrowUpFromLine className="h-4 w-4" /> Withdraw Funds
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <div className="text-sm text-slate-400">
            Pending Withdrawals: <span className="text-amber-500 font-bold">₹{pendingAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading history...</div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-2xl">
              No withdrawal history found.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-[rgb(var(--text-secondary))] whitespace-nowrap">
              <thead>
                <tr className="border-b border-[rgba(var(--border-subtle))] text-xs uppercase tracking-wider text-[rgb(var(--text-muted))]">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Fees</th>
                  <th className="py-3 px-4 text-right">Net Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(var(--border-subtle))]">
                {withdrawals.map((item) => {
                  const totalFees = item.platformFee + item.processingFee + item.gst;
                  return (
                    <tr key={item._id} className="hover:bg-[rgb(var(--bg-elevated))] transition">
                      <td className="py-4 px-4 font-medium text-[rgb(var(--text-primary))]">{item.referenceNumber}</td>
                      <td className="py-4 px-4 text-right font-medium">₹{item.amount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-rose-400">-₹{totalFees.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-sky-400">₹{item.netAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(item.status)}`}>
                          {getStatusIcon(item.status)} {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isWithdrawalModalOpen && (
        <WithdrawalModal 
          onClose={() => setIsWithdrawalModalOpen(false)} 
          onSuccess={refreshWallet} 
        />
      )}
      {isDepositModalOpen && (
        <DepositModal 
          onClose={() => setIsDepositModalOpen(false)} 
          onSuccess={refreshWallet} 
        />
      )}
    </section>
  );
};

export default WalletPage;
