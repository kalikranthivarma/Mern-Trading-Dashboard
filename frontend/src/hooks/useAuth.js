import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hasSessionMarker, refreshAccessToken } from '../services/authService';
import { setCredentials, clearCredentials } from '../redux/slices/authSlice';
import { setAuthToken } from '../services/api';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!hasSessionMarker()) {
        setAuthToken(null);

        if (auth.isAuthenticated || auth.accessToken || auth.user) {
          dispatch(clearCredentials());
        }

        return;
      }

      if (auth.accessToken) {
        setAuthToken(auth.accessToken);
        return;
      }

      try {
        const data = await refreshAccessToken();

        if (data?.accessToken) {
          dispatch(setCredentials({
            user: data.user || auth.user,
            accessToken: data.accessToken
          }));
        }
      } catch (error) {
        setAuthToken(null);
        dispatch(clearCredentials());
      }
    };

    initializeAuth();
  }, [auth.accessToken, auth.isAuthenticated, auth.user, dispatch]);
};
