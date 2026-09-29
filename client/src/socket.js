import { io } from 'socket.io-client';

// Determine backend URL (default to localhost:5000 in development)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `${window.location.protocol}//${window.location.hostname}:5000`);

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

export const connectSocket = (username, roomId) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('join-room', { username, roomId });
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.emit('leave-room');
    socket.disconnect();
  }
};
