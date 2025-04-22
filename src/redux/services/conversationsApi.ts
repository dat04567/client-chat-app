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
    
    // Query endpoint cho việc lấy messages của một conversation
    getConversationMessages: builder.query<{
      messages: any[],
      lastEvaluatedKey: string | null,
      currentUserId: string,
      otherUser: any,
      conversationType: string,
      conversation: any
    }, { conversationId: string | number, limit?: number, lastEvaluatedMessageId?: string }>({
      queryFn: async ({ conversationId, limit, lastEvaluatedMessageId }) => {
        try {
          const { fetchConversationMessagesAction } = await import('@/app/actions/converstations');
          const result = await fetchConversationMessagesAction(conversationId, limit, lastEvaluatedMessageId);
          
          if ('error' in result) {
            return { error: { status: 'CUSTOM_ERROR', error: result.error } };
          }
          return { data: result };
        } catch (error) {
          console.log("Error fetching messages:", error);
         
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      // // Merge function để xử lý loadMore tốt hơn
      serializeQueryArgs: ({ queryArgs }) => {
        // Serialize tất cả trừ lastEvaluatedMessageId, đảm bảo cache chỉ dựa vào conversationId và limit
        return { conversationId: queryArgs.conversationId, limit: queryArgs.limit };
      },
      // Merge function để hỗ trợ pagination với loadMore
      merge: (currentCache, newItems, { arg: { lastEvaluatedMessageId } }) => {
        // Nếu là first load hoặc refresh, thay thế toàn bộ dữ liệu
        if (!lastEvaluatedMessageId) {
          return newItems;
        }
        
        // Nếu là loadMore, kết hợp messages từ cache hiện tại và dữ liệu mới
        return {
          ...newItems,
          messages: [...currentCache.messages, ...newItems.messages],
        };
      },
      // Giữ dữ liệu cũ trong cache mỗi khi có fetch mới
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result, error, { conversationId }) => [{ type: 'Messages', id: conversationId }]
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
    createGroupConversation: builder.mutation<Conversation, { groupName: string, participantIds: string[], groupImage?: string }>({
      queryFn: async ({ groupName, participantIds, groupImage }) => {
        try {
          const { createGroupConversationAction } = await import('@/app/actions/converstations');
          const result = await createGroupConversationAction(groupName, participantIds, groupImage);
          
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

    // Gửi tin nhắn mới - Fixed to prevent stack overflow
    sendMessage: builder.mutation<any, { conversationId: string | number, content: string, type?: string }>({
      queryFn: async ({ conversationId, content, type = 'TEXT' }) => {
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
        // Remove any circular references
        let currentUserId = null;
        
        try {
          // Safe way to get user ID to avoid circular references
          if (typeof window !== 'undefined' && window.localStorage) {
            const userInfo = window.localStorage.getItem('userInfo');
            if (userInfo) {
              const parsedUser = JSON.parse(userInfo);
              currentUserId = parsedUser.id || null;
            }
          }
        } catch (error) {
          console.error("Error getting current user ID:", error);
        }
        
        if (!currentUserId) return;
        
        // Create a simple temporary message object (avoid complex nested objects)
        const tempMessage = {
          conversationId,
          messageId: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          senderId: currentUserId,
          type: 'TEXT',
          content,
          status: 'SENDING',
          isCurrentUserSender: true,
          sender: {
            id: currentUserId
            // Keep sender object minimal to avoid circular references
          }
        };
        
        // Create a clone to avoid mutation issues and circular references
        const safeMessage = JSON.parse(JSON.stringify(tempMessage));
        
        // Add message to cache with proper type checking
        const patchResult = dispatch(
          conversationsApi.util.updateQueryData(
            'getConversationMessages', 
            { conversationId, limit: undefined, lastEvaluatedMessageId: undefined }, 
            (draft) => {
              if (draft && Array.isArray(draft.messages)) {
                draft.messages.push(safeMessage);
              }
            }
          )
        );
        
        try {
          // Wait for server response
          const { data: sentMessage } = await queryFulfilled;
          
          // When result is received, update cache with actual ID
          dispatch(
            conversationsApi.util.updateQueryData(
              'getConversationMessages', 
              { conversationId, limit: undefined, lastEvaluatedMessageId: undefined }, 
              (draft) => {
                if (draft && Array.isArray(draft.messages)) {
                  // Find and replace temp message
                  const index = draft.messages.findIndex(msg => msg.messageId === safeMessage.messageId);
                  if (index !== -1) {
                    draft.messages[index] = sentMessage;
                  }
                }
              }
            )
          );
          
          // Update conversation list with latest message info
          dispatch(
            conversationsApi.util.updateQueryData('getConversations', undefined, (draft) => {
              if (Array.isArray(draft)) {
                const conversation = draft.find(c => c.conversationId === conversationId);
                if (conversation) {
                  conversation.lastMessageText = sentMessage.content;
                  conversation.lastMessageAt = sentMessage.createdAt;
                }
              }
            })
          );
          
        } catch (error) {
          // If error occurs, rollback optimistic update
          patchResult.undo();
          
          // Update message status to error
          dispatch(
            conversationsApi.util.updateQueryData(
              'getConversationMessages', 
              { conversationId, limit: undefined, lastEvaluatedMessageId: undefined }, 
              (draft) => {
                if (draft && Array.isArray(draft.messages)) {
                  const index = draft.messages.findIndex(msg => msg.messageId === safeMessage.messageId);
                  if (index !== -1) {
                    draft.messages[index].status = 'ERROR';
                  }
                }
              }
            )
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