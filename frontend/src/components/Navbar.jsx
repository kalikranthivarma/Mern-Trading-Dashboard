import { Bell, UserCircle, Search, Moon, Sun, Menu } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onMenuClick }) => {
  const user = useSelector((state) => state.auth.user);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[rgba(var(--border-strong))] bg-[rgba(var(--bg-surface),0.8)] backdrop-blur-xl">
      <div className="flex items-center gap-3 md:gap-4">
        <button 
          className="md:hidden p-1 text-[rgb(var(--text-secondary))] hover:text-sky-500"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </button>
        <button className="hidden sm:block text-[rgb(var(--text-secondary))] hover:text-sky-500">
          <Search className="h-5 w-5" />
        </button>
        <h2 className="text-lg md:text-xl font-semibold hidden sm:block">Market Overview</h2>
        <h2 className="text-lg font-semibold sm:hidden">TradePulse</h2>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="text-[rgb(var(--text-secondary))] hover:text-sky-500 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button className="text-[rgb(var(--text-secondary))] hover:text-sky-500">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 md:gap-3 rounded-2xl bg-[rgb(var(--bg-elevated))] px-2 py-1 md:px-3 md:py-2">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <UserCircle className="h-6 w-6 md:h-7 md:w-7 text-sky-500" />
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">{user?.role || 'Viewer'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
