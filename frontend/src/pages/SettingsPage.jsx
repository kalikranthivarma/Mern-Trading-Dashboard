import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Shield, User, Key, Bell, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from '../services/authService';
import { setCredentials } from '../redux/slices/authSlice';

const SettingsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const dispatch = useDispatch();
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Trader',
    phone: user?.phone || ''
  });

  const [notifications, setNotifications] = useState({
    tradeConfirmations: true,
    priceAlerts: false,
    securityAlerts: true,
    weeklyReports: true
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone
      });
      
      dispatch(setCredentials({ user: updatedUser, accessToken }));
      toast.success('Profile settings updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error?.response?.data?.message || 'Failed to update profile settings');
    }
  };

  const handleToggle = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Notification preferences updated!');
  };

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="mt-2 text-slate-400">Configure your profile info, security preferences, and real-time email alerts.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Settings Navigation Sidebar */}
        <div className="space-y-2">
          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-400">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{user?.name || 'Guest User'}</h3>
                <p className="text-sm text-slate-500 uppercase tracking-wider">{user?.role || 'Trader'}</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button className="flex w-full items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-left font-semibold text-white transition">
                <User className="h-5 w-5 text-sky-400" />
                <span>Profile info</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-2xl text-slate-400 hover:text-white px-4 py-3 text-left font-semibold transition hover:bg-slate-900/50">
                <Shield className="h-5 w-5 text-slate-500" />
                <span>Security</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-2xl text-slate-400 hover:text-white px-4 py-3 text-left font-semibold transition hover:bg-slate-900/50">
                <Key className="h-5 w-5 text-slate-500" />
                <span>API Keys</span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-2xl text-slate-400 hover:text-white px-4 py-3 text-left font-semibold transition hover:bg-slate-900/50">
                <Bell className="h-5 w-5 text-slate-500" />
                <span>Alerts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="space-y-6">
          {/* Profile Form */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-sky-400" /> Profile Information
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-300 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 font-medium">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-300 font-medium">Trading Role</label>
                  <input
                    type="text"
                    value={profileForm.role}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950 px-4 py-3 text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 font-medium">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-400 transition"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-full bg-sky-500 hover:bg-sky-400 px-6 py-3 text-sm font-semibold text-white transition mt-4"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Notifications Preferences */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-400" /> Notifications & Alerts
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">Trade Executions</p>
                  <p className="text-xs text-slate-500 mt-1">Receive immediate emails for every buy/sell trade completed</p>
                </div>
                <button
                  onClick={() => handleToggle('tradeConfirmations')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notifications.tradeConfirmations ? 'bg-sky-500' : 'bg-slate-800'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.tradeConfirmations ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">Real-Time Price Alerts</p>
                  <p className="text-xs text-slate-500 mt-1">Get notifications when assets hit custom key levels</p>
                </div>
                <button
                  onClick={() => handleToggle('priceAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notifications.priceAlerts ? 'bg-sky-500' : 'bg-slate-800'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.priceAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Security Alerts</p>
                  <p className="text-xs text-slate-500 mt-1">Critical account access and password change notifications</p>
                </div>
                <button
                  onClick={() => handleToggle('securityAlerts')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${notifications.securityAlerts ? 'bg-sky-500' : 'bg-slate-800'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${notifications.securityAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsPage;
