import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useDispatch } from 'react-redux';
import { conversationsApi } from '@/redux/services/conversationsApi';
import { AppDispatch } from '@/redux/store';

/**
 * Custom hook để quản lý kết nối socket trong cuộc trò chuyện
 */
export const useChatSocket = (conversationId: string, currentUserId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const { on, off, emit, connect, isConnected } = useSocket();
  const [error, setError] = useState<string | null>(null);
  const [hasJoinedConversation, setHasJoinedConversation] = useState(false);
  
  // Kết nối đến socket khi component được mount
  useEffect(() => {
    connect();
    return () => {}; // Không cần disconnect vì socket có thể được dùng ở nơi khác
  }, [connect]);
  
  // Thiết lập xử lý sự kiện socket cho việc tham gia cuộc trò chuyện
  useEffect(() => {
    if (isConnected && conversationId) {
      // Emit sự kiện để tham gia phòng cuộc trò chuyện
      emit('open-conversation', { conversationId });
      
      // Lắng nghe các lỗi
      const handleError = (error: { message: string }) => {
        console.error('Error joining conversation:', error.message);
        setError(error.message);
      };
      
      on('error', handleError);
      
      return () => {
        // Dọn dẹp các event listener khi component unmount
        off('join-confirmation');
        off('error');
      };
    }
  }, [isConnected, conversationId, emit, on, off]);
  
  // Thiết lập xử lý cho tin nhắn mới
  useEffect(() => {
    const handleNewMessage = (data: {
      messageId?: string;
      id?: string;
      conversationId: string;
      senderId: string;
      content: string;
      createdAt?: string;
      updatedAt?: string;
      type?: string;
      status?: string;
      senderName?: string;
      sender?: any;
      senderProfile?: any;
    }) => {
      if (data.conversationId === conversationId) {
        // Tạo đối tượng tin nhắn mới
        const newMessage = {
          messageId: data.messageId || data.id || `temp-${Date.now()}`,
          conversationId: data.conversationId,
          senderId: data.senderId,
          content: data.content,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
          type: data.type || 'TEXT',
          status: data.status || 'DELIVERED',
          senderName: data.senderName,
          isCurrentUserSender: data.senderId === currentUserId,
          sender: data.sender || {
            id: data.senderId,
            username: data.senderName || 'User',
            profile: data.senderProfile || {}
          }
        };
        
        // Thêm trực tiếp tin nhắn vào danh sách hiện có thay vì refetch
        dispatch(
          conversationsApi.util.updateQueryData(
            'getConversationMessages',
            {
              conversationId: conversationId,
              limit: 20,
              lastEvaluatedMessageId: null,
            },
            (draft) => {
              if (draft && Array.isArray(draft.messages)) {
                draft.messages.push(newMessage);
              }
            }
          )
        );
      }
    };
    
    on('new-message', handleNewMessage);
    
    return () => {
      off('new-message');
    };
  }, [conversationId, on, off, dispatch, currentUserId]);
  
  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      
      const messageData = {
        conversationId,
        content: content.trim(),
        senderId: currentUserId,
        type: 'TEXT',
        createdAt: new Date().toISOString(),
      };
      
      emit('send-message', messageData);
      
      // Tạo tin nhắn lạc quan (optimistic update)
      const optimisticMessage = {
        messageId: `temp-${Date.now()}`,
        conversationId,
        senderId: currentUserId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        type: 'TEXT',
        status: 'SENDING',
        isCurrentUserSender: true,
        sender: {
          id: currentUserId,
        }
      };
      
      // Cập nhật giao diện người dùng với tin nhắn mới trước khi server phản hồi
      dispatch(
        conversationsApi.util.updateQueryData(
          'getConversationMessages',
          {
            conversationId,
            limit: 20,
            lastEvaluatedMessageId: null,
          },
          (draft) => {
            if (draft && Array.isArray(draft.messages)) {
              draft.messages.push(optimisticMessage);
            }
          }
        )
      );
    },
    [conversationId, currentUserId, emit, dispatch]
  );
  
  return {
    error,
    isConnected,
    sendMessage,
    hasJoinedConversation,
  };
};
