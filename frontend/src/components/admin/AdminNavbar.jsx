import React from "react";
import { Menu, Bell, Search, User, Settings, HelpCircle } from "lucide-react";

const AdminNavbar = ({ toggleSidebar }) => {
  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:flex items-center bg-slate-900 rounded-lg px-4 py-2 border border-slate-700/50 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all max-w-md w-full">
          <Search size={16} className="text-slate-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search users, orders, assets..." 
            className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder-slate-500"
          />
          <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <HelpCircle size={18} />
          <span>Help</span>
        </button>

        <div className="h-6 w-px bg-slate-800 hidden sm:block mx-1"></div>

        <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/50 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
        </button>
        <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/50 transition-colors">
          <Settings size={20} />
        </button>
        
        <div className="h-6 w-px bg-slate-800 hidden sm:block mx-1"></div>
        
        <div className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center border border-indigo-400/30 font-medium text-sm shadow-md">
            AD
          </div>
          <div className="hidden sm:block text-sm">
            <p className="font-semibold text-slate-200 leading-tight group-hover:text-white transition-colors">Admin User</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
