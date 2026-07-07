import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { login } from '../services/authService';
import { setCredentials } from '../redux/slices/authSlice';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      dispatch(setCredentials({ user: result.user, accessToken: result.accessToken }));
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to sign in');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Welcome back</h1>
      <p className="mt-2 text-slate-400">Sign in to access your trading dashboard.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label className="text-sm text-slate-300">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
          />
          {errors.email && <p className="mt-1 text-sm text-rose-400">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm text-slate-300">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
          />
          {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-3xl bg-sky-500 px-5 py-3 text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sign in
        </button>
      </form>
      <div className="mt-6 text-sm text-slate-400">
        <span>New to the platform? </span>
        <Link to="/register" className="text-sky-300 hover:underline">Create account</Link>
      </div>
      <div className="mt-4 text-sm text-slate-400">
        <Link to="/forgot-password" className="text-slate-300 hover:text-sky-300">Forgot password?</Link>
      </div>
    </div>
  );
};

export default LoginPage;
