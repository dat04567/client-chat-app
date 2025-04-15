"use server";

import axios from 'axios';
import { cookies } from 'next/headers';

// Hàm action để fetch contacts
export async function fetchContactsAction(searchQuery: string = '') {
   try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const token = cookies().get('token')?.value;

      const response = await axios.get(
         `${apiUrl}/users/contacts?search=${encodeURIComponent(searchQuery)}`,
         {
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         }
      );

      if (response.status !== 200) {
         throw new Error('Không thể tải danh sách liên hệ');
      }


      return response.data;
   } catch (error) {
      console.error('Error fetching contacts:', error);
      return {
         sucess: false,
         error: 'Không thể tải danh sách liên hệ'
      };
   }
}

// Hàm action để search users
export async function searchUsersAction(searchQuery: string) {
   try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const token = cookies().get('token')?.value;

      const response = await axios.get(
         `${apiUrl}/users/search?name=${encodeURIComponent(searchQuery)}`,
         {
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         }
      );


      if (response.status !== 200) {
         throw new Error('Đã xảy ra lỗi khi tìm kiếm người dùng');
      }


      return await response.data;
   } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
         console.error('Error searching users:', error.response.data);
         return { success: false, error: error.response.data.message || error.response.data.error || "Đăng nhập thất bại" };
      }

      return { success: false, error: 'Đã xảy ra lỗi khi tìm kiếm người dùng' };
   }
}