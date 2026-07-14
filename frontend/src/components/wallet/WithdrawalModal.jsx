import { useState } from 'react';
import { X, ArrowRight, Building2, Banknote, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import toast from 'react-hot-toast';

const WithdrawalModal = ({ onClose, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Bank Transfer');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Fees Simulation (In a real app, you could fetch this from an API endpoint, but we'll calculate client side for UI responsiveness, the server will strictly recalculate it anyway).
  const platformFee = 25;
  const processingFee = 10;
  const gstPercent = 18;
  const gstAmount = (platformFee + processingFee) * (gstPercent / 100);
  const totalCharges = platformFee + processingFee + gstAmount;

  const numAmount = Number(amount);
  const netAmount = numAmount > totalCharges ? numAmount - totalCharges : 0;

  const availableBalance = user?.availableBalance || 0;

  const handleNext = () => {
    if (numAmount < 100) return toast.error("Minimum withdrawal is ₹100");
    if (numAmount > availableBalance) return toast.error("Insufficient available balance");
    if (netAmount <= 0) return toast.error("Amount must cover transaction fees");

    if (method === 'Bank Transfer') {
      if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
        return toast.error("Please fill in all bank details");
      }
    } else {
      if (!bankDetails.upiId) {
        return toast.error("Please provide a valid UPI ID");
      }
    }

    setStep(2); // Go to confirmation
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        amount: numAmount,
        method,
        bankDetails,
        remarks
      };

      const { data } = await api.post('/withdrawals/request', payload);
      
      if (data.success) {
        toast.success("Withdrawal request submitted successfully!");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h3 className="text-xl font-semibold text-white">
            {step === 1 ? 'Withdraw Funds' : 'Confirm Withdrawal'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Amount */}
              <div>
                <label className="text-sm font-medium text-slate-300">Amount (₹)</label>
                <div className="relative mt-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5000"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3 pl-10 pr-4 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <button 
                    onClick={() => setAmount(availableBalance.toString())}
                    className="absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-sky-400 hover:text-sky-300 uppercase"
                  >
                    Max
                  </button>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-400">
                  <span>Available: ₹{availableBalance.toLocaleString()}</span>
                  <span>Min: ₹100</span>
                </div>
              </div>

              {/* Method Selection */}
              <div>
                <label className="text-sm font-medium text-slate-300">Withdrawal Method</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMethod('Bank Transfer')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition ${
                      method === 'Bank Transfer' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-white/10 hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <Building2 className="h-4 w-4" /> Bank Transfer
                  </button>
                  <button
                    onClick={() => setMethod('UPI')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition ${
                      method === 'UPI' ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-white/10 hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <Banknote className="h-4 w-4" /> UPI
                  </button>
                </div>
              </div>

              {/* Bank/UPI Details */}
              <div className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                {method === 'Bank Transfer' ? (
                  <>
                    <input
                      type="text"
                      placeholder="Bank Name"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="IFSC Code"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value})}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                    />
                  </>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. name@okhdfc)"
                    value={bankDetails.upiId}
                    onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Remarks */}
              <div>
                <input
                  type="text"
                  placeholder="Remarks (Optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Fee Breakdown live preview */}
              {numAmount > 0 && (
                <div className="rounded-2xl bg-slate-950 p-4 border border-white/5 space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Withdrawal Amount</span>
                    <span>₹{numAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Platform Fee</span>
                    <span>₹{platformFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Processing Fee</span>
                    <span>₹{processingFee.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>GST (18%)</span>
                    <span>₹{gstAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 flex justify-between font-semibold text-white">
                    <span>You Receive</span>
                    <span className="text-emerald-400">₹{netAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center p-4 bg-sky-500/10 rounded-3xl border border-sky-500/20 text-center">
                <ShieldCheck className="h-10 w-10 text-sky-400 mb-2" />
                <h4 className="text-sm font-semibold text-sky-400 uppercase tracking-widest">Final Confirmation</h4>
                <p className="mt-2 text-2xl font-bold text-white">₹{netAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                <p className="text-xs text-slate-400 mt-1">Net amount after ₹{totalCharges.toLocaleString()} total fees</p>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/5 bg-slate-950 p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Method</span>
                  <span className="font-semibold text-white">{method}</span>
                </div>
                {method === 'Bank Transfer' ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Bank</span>
                      <span className="font-semibold text-white">{bankDetails.bankName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Account</span>
                      <span className="font-semibold text-white">{bankDetails.accountNumber}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">UPI ID</span>
                    <span className="font-semibold text-white">{bankDetails.upiId}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Your withdrawal will be moved to <strong className="text-amber-400">Locked Balance</strong> immediately. 
                  It usually takes 1-2 business days for Admins to process and approve the request. Once approved, funds will be transferred to your selected account.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-white/10 bg-slate-950/50 p-6">
          {step === 1 ? (
            <>
              <button 
                onClick={onClose}
                className="w-full rounded-xl bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-medium text-white transition hover:bg-sky-400"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setStep(1)}
                disabled={isSubmitting}
                className="w-full rounded-xl bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Confirm & Request'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalModal;
