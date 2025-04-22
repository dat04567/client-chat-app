"use server";
import { cookies } from "next/headers";
import axios from "axios";

// Hàm action để fetch conversations cho user hiện tại
export async function fetchConversationsAction(limit = 20, lastEvaluatedKey?: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;
    
    const response = await axios.get(`${apiUrl}/conversations`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      params: {
        limit,
        lastEvaluatedKey
      }
    });

    // Kiểm tra kết quả từ response
    if (response.status !== 200) {
      throw new Error("Không thể tải danh sách cuộc trò chuyện");
    }


    // Trả về dữ liệu conversations
    return response.data.conversations || [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { error: "Không thể tải danh sách cuộc trò chuyện" };
  }
}

// Hàm action để fetch messages trong một conversation
export async function fetchConversationMessagesAction(conversationId: string | number, limit?: number, lastEvaluatedMessageId?: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    // 2. Fetch messages with pagination support
    const params: Record<string, string | number> = {};
    if (limit) params.limit = limit;
    if (lastEvaluatedMessageId) params.lastEvaluatedMessageId = lastEvaluatedMessageId;
    
    const messagesResponse = await axios.get(`${apiUrl}/conversations/${conversationId}/messages`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      params
    });

    if (messagesResponse.status !== 200) {
      throw new Error("Không thể tải tin nhắn");
    }    
    // Combine conversation metadata with messages

    return {
      ...messagesResponse.data,
    }
  } catch (error) {
    
    return { error: "Không thể tải tin nhắn" };
  }
}

// Hàm action để đánh dấu conversation đã đọc
export async function markConversationAsReadAction(conversationId: string | number) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await axios.put(`${apiUrl}/conversations/${conversationId}/read`, {}, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    // Kiểm tra kết quả từ response
    if (response.status !== 200) {
      throw new Error("Không thể đánh dấu đã đọc");
    }

    return response.data;
  } catch (error) {
    console.error(`Error marking conversation ${conversationId} as read:`, error);
    return { error: "Không thể đánh dấu đã đọc" };
  }
}

// Hàm action để tạo một cuộc trò chuyện one-to-one mới
export async function createOneToOneConversationAction(recipientId: string, content: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await axios.post(
      `${apiUrl}/conversations/one-to-one`, 
      {
        recipientId,
        content
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );

    // Kiểm tra kết quả từ response
    if (response.status !== 201 && response.status !== 200) {
      throw new Error("Không thể tạo cuộc trò chuyện");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return { error: "Không thể tạo cuộc trò chuyện" };
  }
}

// Hàm action để tạo một nhóm trò chuyện mới
export async function createGroupConversationAction(groupName: string, participantIds: string[], groupImage?: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await axios.post(
      `${apiUrl}/conversations/group`, 
      {
        groupName,
        participantIds,
        groupImage // Thêm groupImage vào payload nếu có
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );

    // Kiểm tra kết quả từ response
    if (response.status !== 201 && response.status !== 200) {
      throw new Error("Không thể tạo nhóm trò chuyện");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating group conversation:", error);
    return { error: "Không thể tạo nhóm trò chuyện" };
  }
}

// Hàm action để gửi tin nhắn trong một cuộc trò chuyện
export async function sendMessageAction(conversationId: string | number, content: string, type: string = 'text') {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await axios.post(
      `${apiUrl}/conversations/${conversationId}/messages`, 
      {
        content,
        type
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      }
    );

    // Kiểm tra kết quả từ response
    if (response.status !== 201 && response.status !== 200) {
      throw new Error("Không thể gửi tin nhắn");
    }

    return response.data;
  } catch (error) {
    console.error(`Error sending message to conversation ${conversationId}:`, error);
    return { error: "Không thể gửi tin nhắn" };
  }
}

// Hàm action để lấy ID cuộc trò chuyện mới nhất
export async function getLatestConversationIdAction() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;
    
    if (!token) {
      return { error: "Người dùng chưa đăng nhập" };
    }
    
    // Fetch conversations with limit 1 and sort by most recent
    const response = await axios.get(`${apiUrl}/conversations`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      params: {
        limit: 1,
        sort: "newest"  // Yêu cầu API sắp xếp theo mới nhất (nếu API hỗ trợ)
      }
    });

    if (response.status !== 200) {
      throw new Error("Không thể tải danh sách cuộc trò chuyện");
    }

    // Kiểm tra có conversations hay không
    const conversations = response.data.conversations || [];
    if (conversations.length === 0) {
      return { latestConversationId: null };
    }

    // Trả về ID của cuộc trò chuyện mới nhất
    return { latestConversationId: conversations[0].conversationId };
    
  } catch (error) {
    console.error("Error fetching latest conversation:", error);
    return { error: "Không thể tải cuộc trò chuyện mới nhất" };
  }
}



