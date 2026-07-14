import { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

const DepositModal = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numAmount = Number(amount);

  const handleSubmit = async () => {
    if (isNaN(numAmount) || numAmount < 100) {
      return toast.error("Minimum deposit is ₹100");
    }
    
    setIsSubmitting(true);
    try {
      toast.loading("Initiating secure deposit...", { id: "deposit" });
      const { createPaymentOrder, verifyPaymentSignature } = await import('../../services/paymentService');
      
      const orderRes = await createPaymentOrder(numAmount);
      if (!orderRes.success) throw new Error("Failed to create order");
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        name: "TradePulse Enterprise",
        description: "Wallet Deposit",
        order_id: orderRes.order.id,
        handler: async (response) => {
          try {
            toast.loading("Verifying payment...", { id: "deposit" });
            const verifyRes = await verifyPaymentSignature({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: numAmount,
            });
            
            if (verifyRes.success) {
              toast.success("Deposit successful!", { id: "deposit" });
              onSuccess();
              onClose();
            } else {
              toast.error("Payment verification failed", { id: "deposit" });
            }
          } catch (err) {
            toast.error("Verification failed", { id: "deposit" });
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
            toast.dismiss("deposit");
          }
        },
        theme: { color: "#0ea5e9" }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => {
        toast.error("Payment failed", { id: "deposit" });
        setIsSubmitting(false);
      });
      rzp.open();
      toast.dismiss("deposit");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to initiate deposit", { id: "deposit" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-sky-400" />
            <h3 className="text-xl font-semibold text-white">Deposit Funds</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-300">Amount (₹)</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="5000"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 py-4 pl-10 pr-4 text-2xl font-semibold text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="mt-3 flex gap-2">
                {[1000, 5000, 10000].map(val => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition"
                  >
                    +₹{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl bg-sky-500/10 p-4 border border-sky-500/20">
              <ShieldCheck className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
              <div className="text-xs text-sky-200/80 leading-relaxed">
                Payments are processed securely via <strong className="text-sky-400">Razorpay</strong>. 
                Funds will be instantly added to your Available Balance upon successful transaction.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-white/10 bg-slate-950/50 p-6">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full rounded-xl bg-white/5 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-medium text-white transition hover:bg-sky-400 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>Continue to Payment <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
