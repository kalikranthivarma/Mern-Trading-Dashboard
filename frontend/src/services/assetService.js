import api from './api';

export const getAssets = async (params = {}) => {
  const response = await api.get('/assets', { params });
  return response.data;
};
