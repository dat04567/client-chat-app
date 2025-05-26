"use server";

import axios from 'axios';
import { cookies } from 'next/headers';

/**
 * Server action to update user profile
 * Handles multipart/form-data for avatar upload
 */
export async function updateProfileAction(formData: FormData) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get('token')?.value;

    if (!token) {
      return { success: false, error: 'Không có phiên đăng nhập' };
    }

    // Make the API call to update profile
    const response = await axios.patch(
      `${apiUrl}/users/profile`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Không thể cập nhật thông tin người dùng');
    }

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        error: error.response.data.message || error.response.data.error || "Không thể cập nhật thông tin người dùng" 
      };
    }
    return { 
      success: false, 
      error: 'Không thể cập nhật thông tin người dùng' 
    };
  }
}

/**
 * Server action to get user profile data
 */
export async function getProfileAction() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return { success: false, error: 'Không có phiên đăng nhập' };
    }

    const response = await axios.get(
      `${apiUrl}/users/own`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );

    if (response.status !== 200) {
      throw new Error('Không thể lấy thông tin người dùng');
    }

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    if (axios.isAxiosError(error) && error.response) {
      return { 
        success: false, 
        error: error.response.data.message || error.response.data.error || "Không thể lấy thông tin người dùng" 
      };
    }
    return { 
      success: false, 
      error: 'Không thể lấy thông tin người dùng' 
    };
  }
}
