import { baseApi } from './baseApi';
import { VerificationResponse } from './types';

// API endpoints liên quan đến authentication
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      queryFn: async (credentials) => {
        try {
          // Trong trường hợp credentials là FormData, truyền trực tiếp vào action
          const { login } = await import('@/app/actions/auth');
          const result = await login(credentials);
          
          // Nếu action redirect, có thể không quay lại được đây
          if (!result) {
            return { data: { success: true } };
          }
          
          if (result.success === false) {
            return { error: { status: 'CUSTOM_ERROR', error: result.message } };
          }
          
          return { data: result };
        } catch (error) {
          // Lỗi redirect là bình thường, không cần xử lý
          if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
            return { data: { success: true } };
          }
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Auth']
    }),
    
    register: builder.mutation({
      queryFn: async (userData) => {
        try {
          const { register } = await import('@/app/actions/auth');
          const result = await register(userData);
          
          // Nếu action redirect, có thể không quay lại được đây
          if (!result) {
            return { data: { success: true } };
          }
          
          if (result.success === false) {
            return { error: { status: 'CUSTOM_ERROR', error: result.message } };
          }
          
          return { data: result };
        } catch (error) {
          // Lỗi redirect là bình thường, không cần xử lý
          if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
            return { data: { success: true } };
          }
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      }
    }),
    
    verifyEmail: builder.mutation<VerificationResponse, { token: string; userId: string }>({
      queryFn: async ({ token, userId }) => {
        try {
          const { verifyEmail } = await import('@/app/actions/auth');
          const result = await verifyEmail(token, userId);
          
          if (result.success === false) {
            return { error: { status: 'CUSTOM_ERROR', error: result.message } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['EmailVerification', 'Auth']
    }),
    
    resendVerificationEmail: builder.mutation<VerificationResponse, string>({
      queryFn: async (email) => {
        try {
          const { resendVerificationEmail } = await import('@/app/actions/auth');
          const result = await resendVerificationEmail(email);
          
          if (result.success === false) {
            return { error: { status: 'CUSTOM_ERROR', error: result.message } };
          }
          
          return { data: result };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['EmailVerification']
    }),
  }),
});

// Export các hooks được tạo tự động
export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
} = authApi;