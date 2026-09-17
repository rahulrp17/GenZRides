import React, { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [socketInstance, setSocketInstance] = useState(null);

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    const socketUrl =
      import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
    // auth as a callback → every (re)connect reads the CURRENT token, so
    // token rotations never leave the socket authenticating with a stale one
    // after long background periods.
    const socket = io(socketUrl, {
      auth: (cb) => cb({ token: localStorage.getItem('accessToken') }),
      transports: ['websocket', 'polling'],
      reconnection: true,
      // Generous budget: backend cold-starts and flaky mobile networks can
      // outlast the old 10-attempt budget, leaving the socket dead forever.
      reconnectionAttempts: 30,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    if (import.meta.env.DEV) {
      socket.on('connect', () => console.log('Socket connected'));

      socket.on('connect_error', (err) =>
        console.error('Socket connection error:', err.message)
      );
    }

    socketRef.current = socket;
    setSocketInstance(socket);
    return socket;
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = connect();
    if (!socket) return;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
    };
  }, [user, connect]);

  // Force a fresh connection (used by SessionResume after background):
  // drops the dead socket and reconnects with the current token.
  const reconnect = useCallback(() => {
    try {
      socketRef.current?.disconnect();
    } catch {
      // ignore
    }
    socketRef.current = null;
    setSocketInstance(null);
    connect();
  }, [connect]);

  const emit = (event, data) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event, callback) => {
    socketRef.current?.on(event, callback);
    return () => socketRef.current?.off(event, callback);
  };

  return (
    <SocketContext.Provider value={{ socket: socketInstance, emit, on, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (ctx === null) return { socket: null, emit: () => {}, on: () => () => {}, reconnect: () => {} };
  return ctx;
};
export default SocketContext;
