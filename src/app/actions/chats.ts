"use server";

import { cookies } from "next/headers";

// Hàm action để fetch chats
export async function fetchChatsAction() {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await fetch(`${apiUrl}/chats`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Không thể tải danh sách chat");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { error: "Không thể tải danh sách chat" };
  }
}

// Hàm action để fetch messages trong một cuộc trò chuyện
export async function fetchMessagesAction(conversationId: string, limit?: number, lastEvaluatedMessageId?: string) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    // Xây dựng query parameters
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append("limit", limit.toString());
    if (lastEvaluatedMessageId) queryParams.append("lastEvaluatedMessageId", lastEvaluatedMessageId);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await fetch(`${apiUrl}/conversations/${conversationId}/messages${queryString}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Không thể tải tin nhắn");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { error: "Không thể tải tin nhắn" };
  }
}

// Hàm action để lấy thông tin chi tiết của một tin nhắn
export async function getMessageByIdAction(conversationId: string, messageId: string) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await fetch(`${apiUrl}/conversations/${conversationId}/messages/${messageId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Không thể tải thông tin tin nhắn");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching message details:", error);
    return { error: "Không thể tải thông tin tin nhắn" };
  }
}

// Hàm action để gửi tin nhắn
export async function sendMessageAction(conversationId: string, content: string, recipientId?: string) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const messageData = {
      content,
      senderId: undefined, // Sẽ được xác định bởi server dựa vào token
      recipientId, // Optional
    };

    const response = await fetch(`${apiUrl}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error("Không thể gửi tin nhắn");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Không thể gửi tin nhắn" };
  }
}

// Hàm action để tạo chat mới
export async function createChatAction(userId: number) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await fetch(`${apiUrl}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Không thể tạo cuộc trò chuyện mới");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating chat:", error);
    return { error: "Không thể tạo cuộc trò chuyện mới" };
  }
}

// Hàm action để xóa chat
export async function deleteChatAction(chatId: number) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await fetch(`${apiUrl}/chats/${chatId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể xóa cuộc trò chuyện");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { error: "Không thể xóa cuộc trò chuyện", success: false };
  }
}

// Hàm action để đánh dấu chat đã đọc
export async function markChatAsReadAction(chatId: number) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await fetch(`${apiUrl}/chats/${chatId}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể đánh dấu đã đọc");
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking chat as read:", error);
    return { error: "Không thể đánh dấu đã đọc", success: false };
  }
}

// Hàm action để lấy socket token từ session
export async function getSocketTokenAction() {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await fetch(`${apiUrl}/auth/socket-token`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Không thể lấy token cho socket");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting socket token:", error);
    return { error: "Không thể lấy token cho socket" };
  }
}
