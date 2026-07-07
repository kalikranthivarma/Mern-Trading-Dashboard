import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { CheckCircle2, Loader2, MailCheck, ShieldAlert } from 'lucide-react';
import { verifyEmail } from '../services/authService';
import { setCredentials } from '../redux/slices/authSlice';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const initialToken = searchParams.get('token') || location.state?.verificationToken || '';
  const hasAutoVerified = useRef(false);
  const email = location.state?.email || '';
  const [token, setToken] = useState(initialToken);
  const [status, setStatus] = useState(initialToken ? 'verifying' : 'idle');
  const [message, setMessage] = useState('');

  const title = useMemo(() => {
    if (status === 'success') return 'Email verified';
    if (status === 'error') return 'Verification failed';
    if (status === 'verifying') return 'Verifying email';
    return 'Check your email';
  }, [status]);

  const completeVerification = async (verificationToken) => {
    if (!verificationToken) {
      setStatus('error');
      setMessage('Enter the verification token from your email.');
      return;
    }

    setStatus('verifying');
    setMessage('');

    try {
      const result = await verifyEmail(verificationToken.trim());
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      setStatus('success');
      toast.success('Email verified successfully');
      setTimeout(() => navigate('/dashboard', { replace: true }), 900);
    } catch (error) {
      setStatus('error');
      setMessage(error?.response?.data?.message || 'Invalid or expired verification link.');
    }
  };

  useEffect(() => {
    if (initialToken && !hasAutoVerified.current) {
      hasAutoVerified.current = true;
      completeVerification(initialToken);
    }
  }, [initialToken]);

  const onSubmit = (event) => {
    event.preventDefault();
    completeVerification(token);
  };

  return (
    <div>
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
        {status === 'success' ? (
          <CheckCircle2 className="h-7 w-7" />
        ) : status === 'error' ? (
          <ShieldAlert className="h-7 w-7" />
        ) : status === 'verifying' ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : (
          <MailCheck className="h-7 w-7" />
        )}
      </div>

      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-slate-400">
        {status === 'idle'
          ? `We sent a verification link${email ? ` to ${email}` : ''}. Verify your email before opening the dashboard.`
          : status === 'success'
            ? 'Your account is active. Opening your dashboard now.'
            : status === 'verifying'
              ? 'Please wait while we activate your account.'
              : message}
      </p>

      {status !== 'success' && (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm text-slate-300">Verification token</label>
            <input
              type="text"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              disabled={status === 'verifying'}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
              placeholder="Paste token from email"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'verifying'}
            className="w-full rounded-3xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'verifying' ? 'Verifying...' : 'Verify email'}
          </button>
        </form>
      )}

      <div className="mt-6 text-sm text-slate-400">
        <span>Already verified? </span>
        <Link to="/login" className="text-sky-300 hover:underline">Sign in</Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
