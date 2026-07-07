import { useCallback, useEffect } from 'react';
import socket from '../services/socket';

export const useSocket = () => {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, []);

  const on = useCallback((event, handler) => {
    socket.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socket.off(event, handler);
  }, []);

  const emit = useCallback((event, payload) => {
    socket.emit(event, payload);
  }, []);

  return {
    socket,
    on,
    off,
    emit
  };
};
