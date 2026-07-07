import { useEffect, useState } from 'react';
import api from '../services/api';
import { Bell, ShieldAlert, BadgeDollarSign, Info, FileSpreadsheet } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.notifications || response.data || []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'trade':
        return <BadgeDollarSign className="h-6 w-6 text-emerald-400" />;
      case 'price':
        return <ShieldAlert className="h-6 w-6 text-amber-400" />;
      case 'report':
        return <FileSpreadsheet className="h-6 w-6 text-purple-400" />;
      default:
        return <Info className="h-6 w-6 text-sky-400" />;
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Notifications</h1>
        <p className="mt-2 text-slate-400">Manage real-time alerts, trade execution notices, and system announcements.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-400 border-t-transparent"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-2xl bg-slate-900/50 p-6 text-center">
          <Bell className="h-10 w-10 text-slate-600 mb-2" />
          <p className="text-slate-400">You are all caught up!</p>
          <p className="text-sm text-slate-500 mt-1">No new notifications at this time.</p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6">
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                className={`flex gap-4 items-start rounded-2xl bg-slate-900/50 p-5 border ${
                  notification.read ? 'border-white/5 opacity-70' : 'border-sky-500/20'
                }`}
              >
                <div className="rounded-xl bg-slate-950 p-2.5">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <p className="font-semibold text-white">{notification.title}</p>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(notification.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{notification.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default NotificationsPage;
