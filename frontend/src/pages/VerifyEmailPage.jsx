import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { CheckCircle2, Loader2, MailCheck, ShieldAlert, Timer } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '../services/authService';
import { setCredentials } from '../redux/slices/authSlice';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const token = searchParams.get('token');
  const email = location.state?.email || localStorage.getItem('registeredEmail') || '';
  
  // Status can be: 'idle', 'verifying', 'success', 'error'
  const [status, setStatus] = useState(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState('');
  
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const hasAutoVerified = useRef(false);

  useEffect(() => {
    if (token && !hasAutoVerified.current) {
      hasAutoVerified.current = true;
      completeVerification(token);
    }
  }, [token]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const completeVerification = async (verificationToken) => {
    setStatus('verifying');
    try {
      const result = await verifyEmail(verificationToken);
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      setStatus('success');
      toast.success('Email verified successfully!');
      
      // Auto-redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error?.response?.data?.message || 'Verification link expired or invalid.');
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found. Please log in or register again.');
      return;
    }
    
    setIsResending(true);
    try {
      await resendVerificationEmail(email);
      toast.success('Verification email sent!');
      setCountdown(60);
    } catch (error) {
      const msg = error?.response?.data?.message || 'Failed to resend email.';
      toast.error(msg);
      
      // If the backend threw a 429 rate limit, try to extract seconds from message
      if (error?.response?.status === 429) {
        const match = msg.match(/(\d+)\s+seconds/);
        if (match && match[1]) {
          setCountdown(parseInt(match[1], 10));
        } else {
          setCountdown(60);
        }
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      
      {/* Icon Area */}
      <div className={`mb-8 flex h-20 w-20 items-center justify-center rounded-3xl backdrop-blur-md transition-all duration-500 ${
        status === 'success' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]' :
        status === 'error' ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.2)]' :
        status === 'verifying' ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.2)]' :
        'bg-sky-500/20 text-sky-400 shadow-[0_0_40px_rgba(14,165,233,0.2)]'
      }`}>
        {status === 'success' ? (
          <CheckCircle2 className="h-10 w-10 animate-[scale-in_0.5s_ease-out]" />
        ) : status === 'error' ? (
          <ShieldAlert className="h-10 w-10" />
        ) : status === 'verifying' ? (
          <Loader2 className="h-10 w-10 animate-spin" />
        ) : (
          <MailCheck className="h-10 w-10" />
        )}
      </div>

      {/* Content Area */}
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
        {status === 'success' ? 'Email Verified Successfully' :
         status === 'error' ? 'Verification Failed' :
         status === 'verifying' ? 'Verifying Account...' :
         'Check Your Email'}
      </h1>

      <p className="text-slate-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
        {status === 'idle'
          ? <>We've sent a secure verification link to <span className="font-semibold text-slate-200">{email}</span>. Please click the link to activate your account.</>
          : status === 'success'
            ? 'Your account has been fully activated. You are being redirected to your dashboard securely.'
            : status === 'verifying'
              ? 'Please wait while we validate your security token.'
              : message}
      </p>

      {/* Action Buttons */}
      {status === 'success' ? (
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-full bg-emerald-500 px-8 py-3.5 font-semibold text-white transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          Go to Dashboard
        </button>
      ) : status !== 'verifying' ? (
        <div className="flex flex-col items-center gap-4 w-full max-w-xs">
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-6 py-3.5 font-semibold text-white transition-all hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-600"
          >
            {isResending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {countdown > 0 ? (
              <span className="flex items-center gap-2">
                <Timer className="w-4 h-4" /> Resend in {countdown}s
              </span>
            ) : (
              'Resend Verification Email'
            )}
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Return to Login
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default VerifyEmailPage;
