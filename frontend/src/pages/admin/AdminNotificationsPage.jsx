import React, { useState, useEffect } from "react";
import { Send, Bell, History } from "lucide-react";
import { getAdminNotifications, createGlobalNotification } from "../../services/adminService";

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("SYSTEM");
  const [sending, setSending] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await getAdminNotifications(token);
      if (res.success) setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) return alert("Title and Message are required");
    
    setSending(true);
    try {
      const token = localStorage.getItem("adminToken");
      await createGlobalNotification({ title, message, type }, token);
      setTitle("");
      setMessage("");
      fetchNotifications();
      alert("Notification broadcasted successfully!");
    } catch (error) {
      console.error("Failed to send notification", error);
      alert("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white">System Notifications</h1>
        <p className="text-gray-400 text-sm mt-1">Broadcast important announcements to all users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Send Notification Form */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Send size={20} className="text-indigo-400" />
              New Broadcast
            </h3>
            
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Notification Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled Maintenance"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Message Body</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter the announcement details..."
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="SYSTEM">System Alert (Blue)</option>
                  <option value="ALERT">Critical Alert (Red)</option>
                  <option value="PROMO">Promotion (Green)</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={sending}
                className="w-full mt-4 flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {sending ? "Broadcasting..." : "Broadcast Now"}
              </button>
            </form>
          </div>
        </div>

        {/* Notification History */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <History size={20} className="text-gray-400" />
                Broadcast History
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {loading ? (
                <div className="text-center text-gray-500 py-12">Loading history...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-gray-500 py-12 flex flex-col items-center">
                  <Bell size={48} className="opacity-20 mb-4" />
                  <p>No notifications have been sent yet.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif._id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notif.type === "ALERT" ? "bg-rose-500/20 text-rose-400" :
                        notif.type === "PROMO" ? "bg-emerald-500/20 text-emerald-400" :
                        "bg-indigo-500/20 text-indigo-400"
                      }`}>
                        <Bell size={18} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-white">{notif.title}</h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminNotificationsPage;
