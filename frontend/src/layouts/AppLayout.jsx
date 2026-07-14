import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--bg-base))]">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;