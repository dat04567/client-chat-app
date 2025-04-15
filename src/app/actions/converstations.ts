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

    console.log("Conversations:", response.data);
    

    // Trả về dữ liệu conversations
    return response.data.conversations || [];
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { error: "Không thể tải danh sách cuộc trò chuyện" };
  }
}

// Hàm action để fetch messages trong một conversation
export async function fetchConversationMessagesAction(conversationId: string | number) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await axios.get(`${apiUrl}/conversations/${conversationId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    // Kiểm tra kết quả từ response
    if (response.status !== 200) {
      throw new Error("Không thể tải tin nhắn");
    }

    // Trả về dữ liệu messages từ conversation
    return response.data.messages || [];
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
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
export async function createGroupConversationAction(groupName: string, participantIds: string[]) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
    const token = cookies().get("token")?.value;

    const response = await axios.post(
      `${apiUrl}/conversations/group`, 
      {
        groupName,
        participantIds
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



