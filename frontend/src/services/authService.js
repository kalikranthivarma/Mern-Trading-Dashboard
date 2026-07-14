import api, { setAuthToken } from './api';

const sessionMarkerKey = 'tradingDashboardSessionActive';

export const hasSessionMarker = () => localStorage.getItem(sessionMarkerKey) === 'true';

const setSessionMarker = (isActive) => {
  if (isActive) {
    localStorage.setItem(sessionMarkerKey, 'true');
  } else {
    localStorage.removeItem(sessionMarkerKey);
  }
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const data = response.data?.data || {};

  if (data?.accessToken) {
    setAuthToken(data.accessToken);
    setSessionMarker(true);
  }

  return data;
};

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data?.data || {};
};

export const verifyEmail = async (token) => {
  const response = await api.get(`/auth/verify-email/${token}`);
  const data = response.data?.data || {};

  if (data?.accessToken) {
    setAuthToken(data.accessToken);
    setSessionMarker(true);
  }

  return data;
};

export const resendVerificationEmail = async (email) => {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
};

export const forgotPassword = async (payload) => {
  const response = await api.post('/auth/forgot-password', payload);
  return response.data;
};

export const resetPassword = async (token, payload) => {
  const response = await api.post('/auth/reset-password', { token, ...payload });
  return response.data;
};

export const refreshAccessToken = async () => {
  const response = await api.post('/auth/refresh');
  const data = response.data?.data || {};

  if (data?.accessToken) {
    setAuthToken(data.accessToken);
    setSessionMarker(true);
  }

  return data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  setAuthToken(null);
  setSessionMarker(false);
  return response.data;
};

export const updateProfile = async (payload) => {
  const response = await api.patch('/auth/profile', payload);
  return response.data?.data || response.data;
};
