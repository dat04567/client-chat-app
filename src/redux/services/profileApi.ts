import { baseApi } from './baseApi';
import { getProfileAction, updateProfileAction } from '@/app/actions/profile';

// Interface cho đối tượng Profile
export interface Profile {
  profile: {
    firstName: string;
    lastName: string;
    phone : string;
    avatar: string;
  }
  email: string;
  phoneNumber: string;
  country: string;
  bio: string;
  avatar: string;
}

// API endpoints liên quan đến profile
export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy thông tin profile
    getProfile: builder.query<Profile, void>({
      queryFn: async () => {
        try {
          const response = await getProfileAction();
          if (response.success && response.data) {
            return { data: response.data.user };
          } else {
            return { error: response.error || 'Failed to fetch profile' };
          }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message || 'Failed to fetch profile' } };
        }
      },
      providesTags: ['Profile'],
    }),

    // Cập nhật thông tin profile
    updateProfile: builder.mutation<Profile, FormData>({
      queryFn: async (formData) => {
        try {
          const response = await updateProfileAction(formData);
          if (response.success && response.data) {
            return { data: response.data };
          } else {
            return { error: response.error || 'Failed to update profile' };
          }
        } catch (error: any) {
          return { error: { status: 'FETCH_ERROR', error: error.message || 'Failed to update profile' } };
        }
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

// Export các hooks được tạo tự động bởi RTK Query
export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
} = profileApi;
