"use server";

import { cookies } from 'next/headers';

// Hàm action để fetch chats
export async function fetchChatsAction() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get('token')?.value;
    
    const response = await fetch(
      `${apiUrl}/chats`, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      throw new Error('Không thể tải danh sách chat');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching chats:', error);
    return { error: 'Không thể tải danh sách chat' };
  }
}

// Hàm action để fetch messages trong một chat
export async function fetchMessagesAction(chatId: number) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get('token')?.value;
    
    const response = await fetch(
      `${apiUrl}/chats/${chatId}/messages`, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      throw new Error('Không thể tải tin nhắn');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { error: 'Không thể tải tin nhắn' };
  }
}

// Hàm action để gửi tin nhắn
export async function sendMessageAction(chatId: number, content: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get('token')?.value;
    
    const response = await fetch(
      `${apiUrl}/chats/${chatId}/messages`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Không thể gửi tin nhắn');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return { error: 'Không thể gửi tin nhắn' };
  }
}

// Hàm action để tạo chat mới
export async function createChatAction(userId: number) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get('token')?.value;
    
    const response = await fetch(
      `${apiUrl}/chats`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId }),
      }
    );
    
    if (!response.ok) {
      throw new Error('Không thể tạo cuộc trò chuyện mới');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating chat:', error);
    return { error: 'Không thể tạo cuộc trò chuyện mới' };
  }
}

// Hàm action để xóa chat
export async function deleteChatAction(chatId: number) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get('token')?.value;
    
    const response = await fetch(
      `${apiUrl}/chats/${chatId}`, 
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Không thể xóa cuộc trò chuyện');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting chat:', error);
    return { error: 'Không thể xóa cuộc trò chuyện', success: false };
  }
}

// Hàm action để đánh dấu chat đã đọc
export async function markChatAsReadAction(chatId: number) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get('token')?.value;
    
    const response = await fetch(
      `${apiUrl}/chats/${chatId}/read`, 
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Không thể đánh dấu đã đọc');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error marking chat as read:', error);
    return { error: 'Không thể đánh dấu đã đọc', success: false };
  }
}