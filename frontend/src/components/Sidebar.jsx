import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../services/authService';
import { clearCredentials } from '../redux/slices/authSlice';
import { Home, PieChart, TrendingUp, Briefcase, Bell, Settings, FileText, LogOut, Wallet, ShieldCheck, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { to: '/trading', label: 'Trading', icon: TrendingUp },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/analytics', label: 'Analytics', icon: PieChart },
  { to: '/market', label: 'Assets', icon: FileText },
  { to: '/orders', label: 'Orders', icon: Home },
  { to: '/kyc', label: 'KYC & Profile', icon: ShieldCheck },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings }
];

const Sidebar = ({ isOpen, setIsOpen }) => {
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
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col justify-between h-full glass-card border-r border-[rgba(var(--border-strong))] bg-[rgb(var(--bg-base))]
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'}
        md:relative md:translate-x-0
        md:w-20 lg:w-72
        group md:hover:w-72
        overflow-y-auto overflow-x-hidden
      `}
    >
      <div>
        <div className="flex items-center justify-between mb-10 px-2 lg:px-0 md:px-0 group-hover:px-0">
          <div className="flex-1 overflow-hidden">
            <h1 className="text-xl font-semibold tracking-tight text-sky-500 whitespace-nowrap transition-opacity duration-300 md:opacity-0 lg:opacity-100 group-hover:opacity-100">TradePulse</h1>
            <p className="text-sm text-[rgb(var(--text-muted))] whitespace-nowrap transition-opacity duration-300 md:opacity-0 lg:opacity-100 group-hover:opacity-100">Enterprise Trading Console</p>
          </div>
          {/* Mobile Close Button */}
          <button 
            className="md:hidden p-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))] rounded-xl"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-glass'
                    : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))] hover:text-sky-500'
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="transition-opacity duration-300 md:opacity-0 lg:opacity-100 group-hover:opacity-100">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-rose-400 hover:bg-rose-500/10 transition mt-auto w-full text-left font-medium whitespace-nowrap"
      >
        <LogOut className="h-5 w-5 flex-shrink-0" />
        <span className="transition-opacity duration-300 md:opacity-0 lg:opacity-100 group-hover:opacity-100">Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
