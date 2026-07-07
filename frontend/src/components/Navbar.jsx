import { Bell, UserCircle, Search } from 'lucide-react';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button className="text-slate-300 hover:text-sky-300">
          <Search className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold">Market Overview</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-slate-300 hover:text-sky-300">
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-3 py-2">
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <UserCircle className="h-6 w-6 text-sky-400" />
          )}
          <div>
            <p className="text-sm text-slate-300 font-medium">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'Viewer'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
