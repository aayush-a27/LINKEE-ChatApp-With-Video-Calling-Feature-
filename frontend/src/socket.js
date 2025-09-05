import { io } from 'socket.io-client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';

export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
  autoConnect: false
});

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const listenersRegistered = useRef(false);

  useEffect(() => {
    if (listenersRegistered.current) return;
    
    listenersRegistered.current = true;
    
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleIncomingCall = (callData) => setIncomingCall(callData);
    const handleCallEnd = () => setIncomingCall(null);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-rejected', handleCallEnd);
    socket.on('call-accepted', handleCallEnd);
    socket.on('call-ended', handleCallEnd);

    return () => {
      socket.removeAllListeners();
      listenersRegistered.current = false;
    };
  }, []);

  const connectSocket = (userId) => {
    if (!socket.connected) {
      socket.connect();
      socket.emit('join', userId);
    }
  };

  const disconnectSocket = () => {
    if (socket.connected) {
      socket.disconnect();
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      incomingCall,
      setIncomingCall,
      connectSocket,
      disconnectSocket
    }}>
      {children}
    </SocketContext.Provider>
  );
};