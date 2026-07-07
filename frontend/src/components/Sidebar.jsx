import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../services/authService';
import { clearCredentials } from '../redux/slices/authSlice';
import { Home, PieChart, TrendingUp, Briefcase, Bell, Settings, FileText, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/trading', label: 'Trading', icon: TrendingUp },
  { to: '/analytics', label: 'Analytics', icon: PieChart },
  { to: '/market', label: 'Assets', icon: FileText },
  { to: '/orders', label: 'Orders', icon: Home },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings }
];

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(clearCredentials());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <aside className="w-72 p-6 border-r border-white/10 bg-slate-950/95 flex flex-col justify-between h-full">
      <div>
        <div className="mb-10">
          <h1 className="text-xl font-semibold tracking-tight text-sky-300">TradePulse</h1>
          <p className="text-sm text-slate-400">Enterprise Trading Console</p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-glass'
                    : 'text-slate-300 hover:bg-white/5 hover:text-sky-300'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-rose-400 hover:bg-rose-500/10 transition mt-auto w-full text-left font-medium"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
