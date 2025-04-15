import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { 
    url = 'http://localhost:5000',
    autoConnect = true 
  } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Khởi tạo kết nối socket
  const connect = () => {
    try {
      // Reset error state
      setError(null);

      // Lấy token trực tiếp từ cookie
      const token = Cookies.get('token');
      
      if (!token) {
        throw new Error('Token không tồn tại trong cookie');
      }
      
      // Khởi tạo socket với token
      const socketInstance = io(url, {
        transports: ['websocket'],
        timeout: 20000,
        auth: {
          token: token
        },
        // Đảm bảo gửi cookies với yêu cầu socket nếu cần
        withCredentials: true
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected successfully', socketInstance.id);
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setError(err);
        setIsConnected(false);
      });

      // Lưu socket instance vào ref
      socketRef.current = socketInstance;

      return socketInstance;
    } catch (err) {
      console.error('Socket initialization error:', err);
      setError(err instanceof Error ? err : new Error('Unknown socket error'));
      return null;
    }
  };

  // Ngắt kết nối socket
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  // Khởi tạo socket khi component mount nếu autoConnect=true
  useEffect(() => {
    let socketInstance: Socket | null = null;
    
    if (autoConnect) {
      socketInstance = connect();
    }

    // Cleanup khi component unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [url, autoConnect]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect,
  };
}