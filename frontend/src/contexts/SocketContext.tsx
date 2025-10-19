import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../utils/constants';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinTaskRoom: (taskId: string) => void;
  leaveTaskRoom: (taskId: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return;
    }

    // Create socket connection
    const socketUrl = API_BASE_URL.replace('/api', '');
    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('⚠️ Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const joinTaskRoom = useCallback(
    (taskId: string) => {
      if (socket && isConnected) {
        socket.emit('join-task', taskId);
      }
    },
    [socket, isConnected]
  );

  const leaveTaskRoom = useCallback(
    (taskId: string) => {
      if (socket && isConnected) {
        socket.emit('leave-task', taskId);
      }
    },
    [socket, isConnected]
  );

  const value: SocketContextType = {
    socket,
    isConnected,
    joinTaskRoom,
    leaveTaskRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// Custom hook to use socket context
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
