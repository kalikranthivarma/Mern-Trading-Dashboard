import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data);
      toast.success(result.verification?.emailSent ? 'Verification email sent' : 'Account created. Verification email could not be sent.');
      navigate('/verify-email', {
        state: {
          email: data.email,
          verificationToken: result.verification?.verificationToken
        }
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to register');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Create your account</h1>
      <p className="mt-2 text-slate-400">Register for enterprise trading access.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label className="text-sm text-slate-300">Full name</label>
          <input
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
          />
          {errors.name && <p className="mt-1 text-sm text-rose-400">{errors.name.message}</p>}
        </div>
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
            {...register('password', {
              required: 'Password is required',
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
                message: 'Use uppercase, lowercase, number, and special character'
              }
            })}
            className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-900 px-4 py-3"
          />
          {errors.password && <p className="mt-1 text-sm text-rose-400">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-3xl bg-sky-500 px-5 py-3 text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Create account
        </button>
      </form>
      <div className="mt-6 text-sm text-slate-400">
        <span>Already have an account? </span>
        <Link to="/login" className="text-sky-300 hover:underline">Sign in</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
