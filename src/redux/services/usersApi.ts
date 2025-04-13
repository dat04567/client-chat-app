import { baseApi } from './baseApi';
import { User } from './types';
import { fetchContactsAction, searchUsersAction } from '@/app/actions/users';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

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
                data: result.error,
              } as FetchBaseQueryError
            };
          }
          
          // Trả về dữ liệu thành công
          return { data: result as User[] };
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
          return { 
            error: {
              status: 'CUSTOM_ERROR',
              data: 'Đã xảy ra lỗi khi tìm kiếm người dùng',
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
} = usersApi;