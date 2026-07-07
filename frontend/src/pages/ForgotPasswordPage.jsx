import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/authService';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data);
      toast.success('Password reset email sent. Check your inbox.');
      navigate('/login');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to request reset link');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Forgot password</h1>
      <p className="mt-2 text-slate-400">Enter your email and we’ll send password reset instructions.</p>
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
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-3xl bg-sky-500 px-5 py-3 text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send reset link
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
