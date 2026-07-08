import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Activity, 
  ShoppingCart,
  ArrowRightLeft, 
  BarChart3, 
  FileText,
  ShieldAlert,
  Settings, 
  ShieldCheck,
  Bell,
  User,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { logoutAdmin } from "../../services/adminService";

const AdminSidebar = ({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const location = useLocation();

  const navGroups = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
        { name: "Assets", path: "/admin/assets", icon: <Briefcase size={20} /> },
        { name: "Markets", path: "/admin/market", icon: <Activity size={20} /> },
      ]
    },
    {
      title: "Trading",
      items: [
        { name: "Orders", path: "/admin/orders", icon: <ShoppingCart size={20} /> },
        { name: "Transactions", path: "/admin/transactions", icon: <ArrowRightLeft size={20} /> },
      ]
    },
    {
      title: "Insights",
      items: [
        { name: "Analytics", path: "/admin/analytics", icon: <BarChart3 size={20} /> },
      ]
    },
    {
      title: "Administration",
      items: [
        { name: "System Settings", path: "/admin/settings", icon: <Settings size={20} /> },
        { name: "Notifications", path: "/admin/notifications", icon: <Bell size={20} /> },
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 ${isCollapsed ? 'w-20' : 'w-72'} bg-slate-950 border-r border-slate-800 transform transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <Link to="/admin/dashboard" className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent whitespace-nowrap">
                Terminal Admin
              </span>
            )}
          </Link>
          <button 
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group, idx) => (
            <div key={idx} className="px-3">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      title={isCollapsed ? item.name : ""}
                      className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? "bg-indigo-500/10 text-indigo-400 font-medium" 
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      {item.icon}
                      {!isCollapsed && <span className="text-sm">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 flex flex-col gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'} px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-900 hover:text-slate-300 transition-colors w-full`}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : ""}
            className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2.5 w-full rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200`}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
