import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  timeout?: number;
  transports?: string[];
  withCredentials?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  emit: <T>(event: string, data?: T) => void;
  on: <T>(event: string, callback: (data: T) => void) => void;
  off: (event: string) => void;
}

const DEFAULT_OPTIONS: UseSocketOptions = {
  url: 'http://localhost:5000',
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 20000,
  transports: ['websocket'],
  withCredentials: true,
};

/**
 * Custom hook for managing Socket.IO connections
 * 
 * @param options Socket connection options
 * @returns Socket instance and utility methods
 */
export const useSocket = (options: Partial<UseSocketOptions> = {}): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventsRef = useRef<Record<string, ((...args: any[]) => void)[]>>({});

  // Merge default options with user options
  const mergedOptions: UseSocketOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Initialize socket connection
  const initSocket = useCallback(() => {
    if (socketRef.current) return;

    try {
      socketRef.current = io(mergedOptions.url, {
        autoConnect: mergedOptions.autoConnect,
        reconnection: mergedOptions.reconnection,
        reconnectionAttempts: mergedOptions.reconnectionAttempts,
        timeout: mergedOptions.timeout,
        transports: mergedOptions.transports as any,
        withCredentials: mergedOptions.withCredentials,
      });

      // Set up base event listeners
      socketRef.current.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        setError(null);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setError(err);
        setIsConnected(false);
      });

      // Register saved event listeners if any
      if (eventsRef.current) {
        Object.entries(eventsRef.current).forEach(([event, listeners]) => {
          listeners.forEach(listener => {
            socketRef.current?.on(event, listener);
          });
        });
      }
    } catch (err) {
      console.error('Socket initialization error:', err);
      setError(err instanceof Error ? err : new Error('Unknown socket error'));
    }
  }, [
    mergedOptions.url, 
    mergedOptions.autoConnect, 
    mergedOptions.reconnection,
    mergedOptions.reconnectionAttempts,
    mergedOptions.timeout,
    mergedOptions.transports,
    mergedOptions.withCredentials
  ]);

  // Connect to socket
  const connect = useCallback(() => {
    if (!socketRef.current) {
      initSocket();
    }
    
    if (socketRef.current && !socketRef.current.connected) {
      socketRef.current.connect();
    }
  }, [initSocket]);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  // Emit event
  const emit = useCallback(<T>(event: string, data?: T) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit event "${event}": Socket not connected`);
    }
  }, []);

  // Subscribe to event
  const on = useCallback(<T>(event: string, callback: (data: T) => void) => {
    // Add to events ref to reattach on reconnect
    if (!eventsRef.current[event]) {
      eventsRef.current[event] = [];
    }
    eventsRef.current[event].push(callback);

    // Add to current socket if exists
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Unsubscribe from event
  const off = useCallback((event: string) => {
    if (socketRef.current) {
      socketRef.current.off(event);
    }
    delete eventsRef.current[event];
  }, []);

  // Initialize socket if autoConnect is true
  useEffect(() => {
    if (mergedOptions.autoConnect) {
      initSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [initSocket, mergedOptions.autoConnect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};

export default useSocket;