import api from './api';

export const getPortfolio = async () => {
  const response = await api.get('/portfolio');
  return response.data;
};
