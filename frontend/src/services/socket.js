import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
  : 'http://localhost:5000';

const socket = io(socketUrl, {
  transports: ['websocket'],
  autoConnect: false,
  withCredentials: true
});

export default socket;
