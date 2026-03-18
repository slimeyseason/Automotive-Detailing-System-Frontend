// src/services/socket.js
import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = localStorage.getItem('token');
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  socket = io(socketUrl, {
    auth: {
      token: token || undefined,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    transports: ['websocket', 'polling'], // try websocket first
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    if (err.message === 'Authentication error') {
      // Token invalid → logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

// Get the socket instance (call after initializeSocket)
export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized yet');
    return initializeSocket();
  }
  return socket;
};

// Clean disconnect when logging out / unmounting
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Example usage in a component:
// import { initializeSocket, getSocket } from '@/services/socket';
// useEffect(() => {
//   initializeSocket();
//   const socket = getSocket();
//   socket.on('location-update', (data) => { ... });
//   return () => {
//     socket.off('location-update');
//   };
// }, []);