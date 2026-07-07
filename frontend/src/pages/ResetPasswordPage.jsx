import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { resetPassword } from '../services/authService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await resetPassword(data.token, { password: data.password });
      toast.success('Password updated successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to reset password');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Reset password</h1>
      <p className="mt-2 text-slate-400">Set a new secure password for your account.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label className="text-sm text-slate-300">Reset token</label>
          <input
            type="text"
            {...register('token', { required: 'Reset token is required' })}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
          />
          {errors.token && <p className="mt-1 text-sm text-rose-400">{errors.token.message}</p>}
        </div>
        <div>
          <label className="text-sm text-slate-300">New password</label>
          <input
            type="password"
            {...register('password', { required: 'New password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
          />
          {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-3xl bg-sky-500 px-5 py-3 text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Update password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
