import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import VerifyEmailPage from '../pages/VerifyEmailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import PortfolioPage from '../pages/PortfolioPage';
import TradingPage from '../pages/TradingPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import AssetsPage from '../pages/AssetsPage';
import OrdersPage from '../pages/OrdersPage';
import ReportsPage from '../pages/ReportsPage';
import NotificationsPage from '../pages/NotificationsPage';
import SettingsPage from '../pages/SettingsPage';
import AdminPage from '../pages/AdminPage';
import ProfilePage from '../pages/ProfilePage';
import HelpPage from '../pages/HelpPage';
import AboutPage from '../pages/AboutPage';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ roles }) => {
  const auth = useSelector((state) => state.auth);
  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!auth.user?.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  if (roles && !roles.includes(auth.user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public Landing Page */}
    <Route path="/" element={<LandingPage />} />

    {/* Auth Routes */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Route>

    {/* Protected Terminal Console Routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/trading" element={<TradingPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/market" element={<AssetsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
    </Route>

    {/* Wildcard Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
