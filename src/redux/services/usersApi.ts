import { baseApi } from './baseApi';
import { User } from './types';
import { 
  fetchContactsAction, 
  searchUsersAction, 
  addContactAction, 
  getSentFriendRequestsAction,
  getReceivedFriendRequestsAction,
  acceptFriendRequestAction,
  getFriendsAction
} from '@/app/actions/users';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Interface cho đối tượng Friendship được trả về từ API
interface Friendship {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  requester: User;
  recipient: User;
  createdAt: string;
  updatedAt: string;
}

// Interface cho friend request dựa theo format API thực tế
interface FriendRequest {
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: string;
}

// Interface cho friend được trả về từ API
interface Friend {
  userId: string;
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    avatar?: string;
    status?: 'online' | 'offline' | 'away';
  };
  createdAt: string;
}

// API endpoints liên quan đến users
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContacts: builder.query<User[], string>({
      queryFn: async (searchQuery = '') => {
        try {
          const result = await fetchContactsAction(searchQuery);
          
          // Kiểm tra nếu là response lỗi
          if ('success' in result && result.success === false) {
            return { 
              error: {
                status: 'CUSTOM_ERROR',
                error: result.error,
              } as FetchBaseQueryError
            };
          }
          
          // Trả về dữ liệu thành công
          return { data: result.data  as User[] };
        } catch (error) {
          return { 
            error: {
              status: 'CUSTOM_ERROR',
              data: 'Không thể tải danh sách liên hệ',
            } as FetchBaseQueryError
          };
        }
      },
      providesTags: ['Users']
    }),
    
    searchUsers: builder.query<User[], string>({
      queryFn: async (searchQuery) => {
        try {
          const result = await searchUsersAction(searchQuery);
          
          // Kiểm tra nếu là response lỗi
          if ('success' in result && result.success === false) {
            return { 
              error: {
                status: 'CUSTOM_ERROR',
                data: result.error,
              } as FetchBaseQueryError
            };
          }
          
          // Trả về dữ liệu thành công
          return { data: result.data as User[] };
        } catch (error) {
          console.log('Error searching users:', error);
          
          return { 
            error: {
              status: 'CUSTOM_ERROR',
              data: error.data.error || error.data.message || 'Đã xảy ra lỗi khi tìm kiếm người dùng',
            } as FetchBaseQueryError
          };
        }
      },
      providesTags: ['Users']
    }),

    sendFriendRequest: builder.mutation<{ message: string, friendship: Friendship }, string>({
      queryFn: async (friendId) => {
        try {
          const result = await addContactAction(friendId);
          
          // Kiểm tra nếu là response lỗi
          if (!result.success) {
            return { 
              error: {
                status: 'CUSTOM_ERROR',
                error: result.error,
              } as FetchBaseQueryError
            };
          }
          
          // Trả về dữ liệu thành công
          return { data: result.data };
        } catch (error) {
          return { 
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Không thể gửi lời mời kết bạn',
            } as FetchBaseQueryError
          };
        }
      },
      // Khi mutation thành công, cập nhật lại danh sách contacts
      invalidatesTags: ['Users']
    }),

    getSentFriendRequests: builder.query<FriendRequest[], void>({
      queryFn: async () => {
        try {
          const result = await getSentFriendRequestsAction();
          
          // Kiểm tra nếu là response lỗi
          if (!result.success) {
            return { 
              error: {
                status: 'CUSTOM_ERROR',
                error: result.error,
              } as FetchBaseQueryError
            };
          }
          
          // Trả về dữ liệu thành công
          return { data: result.data.requests || [] };
        } catch (error) {
          return { 
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Không thể tải danh sách lời mời kết bạn đã gửi',
            } as FetchBaseQueryError
          };
        }
      },
      providesTags: ['Users']
    }),

    getReceivedFriendRequests: builder.query<FriendRequest[], void>({
      queryFn: async () => {
        try {
          const result = await getReceivedFriendRequestsAction();
          
          // Kiểm tra nếu là response lỗi
          if (!result.success) {
            return { 
              error: {
                status: 'CUSTOM_ERROR',
                error: result.error,
              } as FetchBaseQueryError
            };
          }
          
          // Trả về dữ liệu thành công
          return { data: result.data.requests || [] };
        } catch (error) {
          return { 
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Không thể tải danh sách lời mời kết bạn đã nhận',
            } as FetchBaseQueryError
          };
        }
      },
      providesTags: ['Users']
    }),

    acceptFriendRequest: builder.mutation<{ message: string, friendship: Friendship }, string>({
      queryFn: async (friendId) => {
        try {
          const result = await acceptFriendRequestAction(friendId);
          
          // Kiểm tra nếu là response lỗi
          if (!result.success) {
            return { 
              error: {
                status: 'CUSTOM_ERROR',
                error: result.error,
              } as FetchBaseQueryError
            };
          }
          
          // Trả về dữ liệu thành công
          return { data: result.data };
        } catch (error) {
          return { 
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Không thể chấp nhận lời mời kết bạn',
            } as FetchBaseQueryError
          };
        }
      },
      // Khi mutation thành công, cập nhật lại danh sách contacts và friend requests
      invalidatesTags: ['Users']
    }),

    getFriends: builder.query<Friend[], void>({
      queryFn: async () => {
        try {
          const result = await getFriendsAction();
          
          // Kiểm tra nếu là response lỗi
          if (!result.success) {
            return { 
              error: {
                status: 'CUSTOM_ERROR',
                error: result.error,
              } as FetchBaseQueryError
            };
          }
          
          // Trả về dữ liệu thành công
          return { data: result.data.friends || [] };
        } catch (error) {
          return { 
            error: {
              status: 'CUSTOM_ERROR',
              error: 'Không thể tải danh sách bạn bè',
            } as FetchBaseQueryError
          };
        }
      },
      providesTags: ['Users']
    }),
  }),
});

// Export các hooks được tạo tự động
export const {
  useGetContactsQuery,
  useSearchUsersQuery,
  useSendFriendRequestMutation,
  useGetSentFriendRequestsQuery,
  useGetReceivedFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useGetFriendsQuery,
} = usersApi;