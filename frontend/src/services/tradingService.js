import api from './api';

export const getTradeBook = async () => {
  const response = await api.get('/trade/book');
  return response.data;
};

export const getTradeHistory = async (params = {}) => {
  const response = await api.get('/trade/history', { params });
  return response.data;
};

export const placeOrder = async (payload) => {
  const { asset, side, quantity, price } = payload;
  const url = `/trade/${side === 'sell' ? 'sell' : 'buy'}`;
  const response = await api.post(url, {
    asset,
    tradeType: side.toUpperCase(),
    quantity,
    price
  });
  return response.data;
};

export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};
