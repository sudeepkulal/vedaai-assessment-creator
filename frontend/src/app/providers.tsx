'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Attempt to connect to backend on port 5000
    const socketInstance = io('http://localhost:5000', {
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  return (
    <Provider store={store}>
      <SocketContext.Provider value={socket}>
        {children}
      </SocketContext.Provider>
    </Provider>
  );
}
