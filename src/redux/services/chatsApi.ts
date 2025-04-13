import { baseApi } from './baseApi';
import { Chat, Message } from './types';

// API endpoints liên quan đến chats và messages
export const chatsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      queryFn: async () => {
        try {
          const { fetchChatsAction } = await import('@/app/actions/chats');
          const result = await fetchChatsAction();
          
          if (result.error) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Chats']
    }),
    
    getChatMessages: builder.query<Message[], number>({
      queryFn: async (chatId) => {
        try {
          const { fetchMessagesAction } = await import('@/app/actions/chats');
          const result = await fetchMessagesAction(chatId);
          
          if (result.error) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, chatId) => [{ type: 'Messages', id: chatId }]
    }),
    
    sendMessage: builder.mutation<Message, { chatId: number; content: string }>({
      queryFn: async ({ chatId, content }) => {
        try {
          const { sendMessageAction } = await import('@/app/actions/chats');
          const result = await sendMessageAction(chatId, content);
          
          if (result.error) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      // Optimistic update để UI responsive
      async onQueryStarted({ chatId, content }, { dispatch, queryFulfilled, getState }) {
        // Lấy userID của user hiện tại để tạo tin nhắn tạm thời
        const currentUserId = null;
        
        if (!currentUserId) return;
        
        // Tạo message tạm thời với thông tin cơ bản
        const tempMessage = {
          id: Date.now(), // Sẽ được thay thế bởi ID thật từ server
          content,
          senderId: currentUserId,
          timestamp: new Date().toISOString(),
          isRead: false,
          status: 'sending'
        };
        
        // Thêm message vào cache ngay lập tức
        const patchResult = dispatch(
          chatsApi.util.updateQueryData('getChatMessages', chatId, (draft) => {
            draft.push(tempMessage);
          })
        );
        
        try {
          // Đợi kết quả từ server
          const { data: sentMessage } = await queryFulfilled;
          
          // Khi nhận được kết quả, cập nhật lại cache với ID thực tế
          dispatch(
            chatsApi.util.updateQueryData('getChatMessages', chatId, (draft) => {
              // Tìm và thay thế tin nhắn tạm
              const index = draft.findIndex(msg => msg.id === tempMessage.id);
              if (index !== -1) {
                draft[index] = sentMessage;
              }
            })
          );
          
          // Cập nhật danh sách chat với tin nhắn mới nhất
          dispatch(
            chatsApi.util.updateQueryData('getChats', undefined, (draft) => {
              const chat = draft.find(c => c.id === chatId);
              if (chat) {
                chat.lastMessage = sentMessage.content;
                chat.lastMessageTime = sentMessage.timestamp;
              }
            })
          );
          
        } catch (error) {
          // Nếu có lỗi, rollback lại thay đổi optimistic update
          patchResult.undo();
          
          // Cập nhật lại message status thành error
          dispatch(
            chatsApi.util.updateQueryData('getChatMessages', chatId, (draft) => {
              const index = draft.findIndex(msg => msg.id === tempMessage.id);
              if (index !== -1) {
                draft[index].status = 'error';
              }
            })
          );
        }
      },
      invalidatesTags: (result, error, { chatId }) => [
        { type: 'Messages', id: chatId },
        'Chats'
      ]
    }),
    
    createChat: builder.mutation<Chat, number>({
      queryFn: async (userId) => {
        try {
          const { createChatAction } = await import('@/app/actions/chats');
          const result = await createChatAction(userId);
          
          if (result.error) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Chats']
    }),
    
    markChatAsRead: builder.mutation<void, number>({
      query: (chatId) => ({
        url: `/chats/${chatId}/read`,
        method: 'PUT'
      }),
      invalidatesTags: (result, error, chatId) => [
        { type: 'Messages', id: chatId },
        'Chats'
      ]
    }),
    
    deleteChat: builder.mutation<{ success: boolean }, number>({
      queryFn: async (chatId) => {
        try {
          // Import dynamically để tránh lỗi "server-only" khi sử dụng server actions
          const { deleteChatAction } = await import('@/app/actions/chats');
          const result = await deleteChatAction(chatId);
          
          if (result.error) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Chats']
    })
  }),
});

// Export các hooks được tạo tự động
export const {
  useGetChatsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useCreateChatMutation,
  useMarkChatAsReadMutation,
  useDeleteChatMutation
} = chatsApi;