import { baseApi } from './baseApi';
import { Conversation, Message, ConversationResponse } from './types';

// API endpoints liên quan đến conversations
export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách cuộc trò chuyện
    getConversations: builder.query<Conversation[], { limit?: number; lastEvaluatedKey?: string } | void>({
      queryFn: async (params) => {
        try {
          const { fetchConversationsAction } = await import('@/app/actions/converstations');
          const limit = params?.limit || 20;
          const lastEvaluatedKey = params?.lastEvaluatedKey;
          const result = await fetchConversationsAction(limit, lastEvaluatedKey);
          
          if ('error' in result) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Conversations']
    }),
    
    // Lấy thông tin chi tiết và tin nhắn của một cuộc trò chuyện
    getConversationMessages: builder.query<Message[], string | number>({
      queryFn: async (conversationId) => {
        try {
          const { fetchConversationMessagesAction } = await import('@/app/actions/converstations');
          const result = await fetchConversationMessagesAction(conversationId);
          
          if ('error' in result) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: (result, error, conversationId) => [{ type: 'Messages', id: conversationId }]
    }),
    
    // Đánh dấu cuộc trò chuyện đã đọc
    markConversationAsRead: builder.mutation<void, string | number>({
      queryFn: async (conversationId) => {
        try {
          const { markConversationAsReadAction } = await import('@/app/actions/converstations');
          const result = await markConversationAsReadAction(conversationId);
          
          if ('error' in result) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: (result, error, conversationId) => [
        { type: 'Messages', id: conversationId },
        'Conversations'
      ]
    }),

    // Tạo cuộc trò chuyện one-to-one mới
    createOneToOneConversation: builder.mutation<ConversationResponse, { recipientId: string, content: string }>({
      queryFn: async ({ recipientId, content }) => {
        try {
          const { createOneToOneConversationAction } = await import('@/app/actions/converstations');
          const result = await createOneToOneConversationAction(recipientId, content);
          
          if ('error' in result) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Conversations']
    }),

    // Tạo cuộc trò chuyện nhóm mới
    createGroupConversation: builder.mutation<Conversation, { groupName: string, participantIds: string[] }>({
      queryFn: async ({ groupName, participantIds }) => {
        try {
          const { createGroupConversationAction } = await import('@/app/actions/converstations');
          const result = await createGroupConversationAction(groupName, participantIds);
          
          if ('error' in result) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Conversations']
    }),

    // Gửi tin nhắn mới
    sendMessage: builder.mutation<Message, { conversationId: string | number, content: string, type?: string }>({
      queryFn: async ({ conversationId, content, type = 'text' }) => {
        try {
          const { sendMessageAction } = await import('@/app/actions/converstations');
          const result = await sendMessageAction(conversationId, content, type);
          
          if ('error' in result) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      // Optimistic update để UI responsive
      async onQueryStarted({ conversationId, content }, { dispatch, queryFulfilled }) {
        // Lấy thông tin user hiện tại từ browser (nếu có)
        let currentUserId = null;
        
        try {
          const userInfo = typeof localStorage !== 'undefined' ? localStorage.getItem('userInfo') : null;
          if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            currentUserId = parsedUser.id || null;
          }
        } catch (error) {
          console.error("Error getting current user ID:", error);
        }
        
        if (!currentUserId) return;
        
        // Tạo message tạm thời với thông tin cơ bản
        const tempMessage = {
          id: Date.now(), // ID tạm thời cho tin nhắn mới
          messageId: `temp-${Date.now()}`,
          conversationId,
          senderId: currentUserId,
          content,
          type: 'text',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'sending'
        };
        
        // Thêm message vào cache để hiển thị ngay lập tức
        const patchResult = dispatch(
          conversationsApi.util.updateQueryData('getConversationMessages', conversationId, (draft) => {
            draft.push(tempMessage);
          })
        );
        
        try {
          // Đợi kết quả từ server
          const { data: sentMessage } = await queryFulfilled;
          
          // Khi nhận được kết quả, cập nhật lại cache với ID thực tế
          dispatch(
            conversationsApi.util.updateQueryData('getConversationMessages', conversationId, (draft) => {
              // Tìm và thay thế tin nhắn tạm
              const index = draft.findIndex(msg => msg.id === tempMessage.id);
              if (index !== -1) {
                draft[index] = sentMessage;
              }
            })
          );
          
          // Cập nhật danh sách cuộc trò chuyện với tin nhắn mới nhất
          dispatch(
            conversationsApi.util.updateQueryData('getConversations', undefined, (draft) => {
              const conversation = draft.find(c => c.conversationId === conversationId);
              if (conversation) {
                conversation.lastMessageText = sentMessage.content;
                conversation.lastMessageAt = sentMessage.createdAt;
              }
            })
          );
          
        } catch (error) {
          // Nếu có lỗi, rollback lại thay đổi optimistic update
          patchResult.undo();
          
          // Cập nhật lại message status thành error
          dispatch(
            conversationsApi.util.updateQueryData('getConversationMessages', conversationId, (draft) => {
              const index = draft.findIndex(msg => msg.id === tempMessage.id);
              if (index !== -1) {
                draft[index].status = 'error';
              }
            })
          );
        }
      },
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        'Conversations'
      ]
    }),
  }),
});

// Export các hooks được tạo tự động
export const {
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useMarkConversationAsReadMutation,
  useCreateOneToOneConversationMutation,
  useCreateGroupConversationMutation,
  useSendMessageMutation
} = conversationsApi;