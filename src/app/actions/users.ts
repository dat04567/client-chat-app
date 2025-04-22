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

// Hàm action để thêm liên hệ mới (gửi lời mời kết bạn)
export async function addContactAction(friendId: string) {
   try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const token = cookies().get('token')?.value;

      const response = await axios.post(
         `${apiUrl}/friendships/request`,
         { friendId },
         {
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         }
      );

      if (response.status !== 200 && response.status !== 201) {
         throw new Error('Không thể gửi lời mời kết bạn');
      }

      return {
         success: true,
         data: response.data
      };
   } catch (error) {
      console.error('Error sending friend request:', error);
      if (axios.isAxiosError(error) && error.response) {
         return { 
            success: false, 
            error: error.response.data.message || error.response.data.error || "Không thể gửi lời mời kết bạn" 
         };
      }
      return { 
         success: false, 
         error: 'Không thể gửi lời mời kết bạn' 
      };
   }
}

// Hàm action để lấy danh sách lời mời kết bạn đã gửi
export async function getSentFriendRequestsAction() {
   try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const token = cookies().get('token')?.value;

      const response = await axios.get(
         `${apiUrl}/friendships/sent`,
         {
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         }
      );

      if (response.status !== 200) {
         throw new Error('Không thể tải danh sách lời mời kết bạn đã gửi');
      }

      return {
         success: true,
         data: response.data
      };
   } catch (error) {
      console.error('Error fetching sent friend requests:', error);
      if (axios.isAxiosError(error) && error.response) {
         return { 
            success: false, 
            error: error.response.data.message || error.response.data.error || "Không thể tải danh sách lời mời kết bạn đã gửi" 
         };
      }
      return { 
         success: false, 
         error: 'Không thể tải danh sách lời mời kết bạn đã gửi' 
      };
   }
}

// Hàm action để lấy danh sách lời mời kết bạn đã nhận
export async function getReceivedFriendRequestsAction() {
   try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const token = cookies().get('token')?.value;

      const response = await axios.get(
         `${apiUrl}/friendships/received`,
         {
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         }
      );

      if (response.status !== 200) {
         throw new Error('Không thể tải danh sách lời mời kết bạn đã nhận');
      }

      return {
         success: true,
         data: response.data
      };
   } catch (error) {
      console.error('Error fetching received friend requests:', error);
      if (axios.isAxiosError(error) && error.response) {
         return { 
            success: false, 
            error: error.response.data.message || error.response.data.error || "Không thể tải danh sách lời mời kết bạn đã nhận" 
         };
      }
      return { 
         success: false, 
         error: 'Không thể tải danh sách lời mời kết bạn đã nhận' 
      };
   }
}

// Hàm action để chấp nhận lời mời kết bạn
export async function acceptFriendRequestAction(friendId: string) {
   try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const token = cookies().get('token')?.value;

      const response = await axios.put(
         `${apiUrl}/friendships/${friendId}/accept`,
         {},
         {
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         }
      );

      if (response.status !== 200) {
         throw new Error('Không thể chấp nhận lời mời kết bạn');
      }

      return {
         success: true,
         data: response.data
      };
   } catch (error) {
      console.error('Error accepting friend request:', error);
      if (axios.isAxiosError(error) && error.response) {
         return { 
            success: false, 
            error: error.response.data.message || error.response.data.error || "Không thể chấp nhận lời mời kết bạn" 
         };
      }
      return { 
         success: false, 
         error: 'Không thể chấp nhận lời mời kết bạn' 
      };
   }
}

// Hàm action để lấy danh sách bạn bè
export async function getFriendsAction() {
   try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const token = cookies().get('token')?.value;

      const response = await axios.get(
         `${apiUrl}/friendships`,
         {
            headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
            },
         }
      );

      if (response.status !== 200) {
         throw new Error('Không thể tải danh sách bạn bè');
      }

      return {
         success: true,
         data: response.data
      };
   } catch (error) {
      console.error('Error fetching friends list:', error);
      if (axios.isAxiosError(error) && error.response) {
         return { 
            success: false, 
            error: error.response.data.message || error.response.data.error || "Không thể tải danh sách bạn bè" 
         };
      }
      return { 
         success: false, 
         error: 'Không thể tải danh sách bạn bè' 
      };
   }
}