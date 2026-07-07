import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import usersReducer from './slices/usersSlice';
import portfolioReducer from './slices/portfolioSlice';
import tradingReducer from './slices/tradingSlice';
import ordersReducer from './slices/ordersSlice';
import assetsReducer from './slices/assetsSlice';
import dashboardReducer from './slices/dashboardSlice';
import reportsReducer from './slices/reportsSlice';
import notificationsReducer from './slices/notificationsSlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';
import loadingReducer from './slices/loadingSlice';
import themeReducer from './slices/themeSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme', 'settings']
};

const rootReducer = combineReducers({
  auth: authReducer,
  users: usersReducer,
  portfolio: portfolioReducer,
  trading: tradingReducer,
  orders: ordersReducer,
  assets: assetsReducer,
  dashboard: dashboardReducer,
  reports: reportsReducer,
  notifications: notificationsReducer,
  settings: settingsReducer,
  ui: uiReducer,
  loading: loadingReducer,
  theme: themeReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export const persistor = persistStore(store);
