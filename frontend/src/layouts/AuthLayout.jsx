import { Outlet } from 'react-router-dom';

const AuthLayout = () => (
  <main className="min-h-screen grid place-items-center px-4 py-10 bg-slate-950">
    <div className="w-full max-w-2xl glass-card p-8">
      <Outlet />
    </div>
  </main>
);

export default AuthLayout;
