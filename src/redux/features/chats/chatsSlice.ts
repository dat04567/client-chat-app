import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Định nghĩa interface Chat
export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  timestamp: string;
  isRead: boolean;
}

export interface Chat {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
  messages: Message[];
}

// Định nghĩa interface ChatsState
interface ChatsState {
  chats: Chat[];
  activeChat: Chat | null;
  loading: boolean;
  error: string | null;
}

// Trạng thái ban đầu
const initialState: ChatsState = {
  chats: [],
  activeChat: null,
  loading: false,
  error: null,
};

// Tạo async thunk để fetch chats
export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await axios.get(`${apiUrl}/chats`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue('Không thể tải danh sách chat');
    }
  }
);

// Tạo async thunk để fetch messages cho một chat
export const fetchMessages = createAsyncThunk(
  'chats/fetchMessages',
  async (chatId: number, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await axios.get(`${apiUrl}/chats/${chatId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return { chatId, messages: response.data };
    } catch (error) {
      return rejectWithValue('Không thể tải tin nhắn');
    }
  }
);

// Tạo async thunk để gửi tin nhắn
export const sendMessage = createAsyncThunk(
  'chats/sendMessage',
  async ({ chatId, content }: { chatId: number, content: string }, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await axios.post(`${apiUrl}/chats/${chatId}/messages`, 
        { content },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return { chatId, message: response.data };
    } catch (error) {
      return rejectWithValue('Không thể gửi tin nhắn');
    }
  }
);

// Tạo chats slice
const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setActiveChat: (state, action: PayloadAction<number>) => {
      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) {
        state.activeChat = chat;
        // Reset unread count when opening a chat
        chat.unreadCount = 0;
      }
    },
    clearActiveChat: (state) => {
      state.activeChat = null;
    },
    markChatAsRead: (state, action: PayloadAction<number>) => {
      const chat = state.chats.find(c => c.id === action.payload);
      if (chat) {
        chat.unreadCount = 0;
      }
    },
    addLocalMessage: (state, action: PayloadAction<{ chatId: number, message: Message }>) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        chat.messages.push(message);
        chat.lastMessage = message.content;
        chat.lastMessageTime = message.timestamp;
        
        // Also update in activeChat if this is the current chat
        if (state.activeChat?.id === chatId) {
          state.activeChat.messages.push(message);
          state.activeChat.lastMessage = message.content;
          state.activeChat.lastMessageTime = message.timestamp;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchChats
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action: PayloadAction<Chat[]>) => {
        state.chats = action.payload;
        state.loading = false;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<{ chatId: number, messages: Message[] }>) => {
        const { chatId, messages } = action.payload;
        const chat = state.chats.find(c => c.id === chatId);
        if (chat) {
          chat.messages = messages;
        }
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        // Không set loading = true để tránh giao diện bị lock
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<{ chatId: number, message: Message }>) => {
        const { chatId, message } = action.payload;
        const chat = state.chats.find(c => c.id === chatId);
        if (chat) {
          chat.messages.push(message);
          chat.lastMessage = message.content;
          chat.lastMessageTime = message.timestamp;
          
          // Also update in activeChat if this is the current chat
          if (state.activeChat?.id === chatId) {
            state.activeChat.messages.push(message);
            state.activeChat.lastMessage = message.content;
            state.activeChat.lastMessageTime = message.timestamp;
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setActiveChat, clearActiveChat, markChatAsRead, addLocalMessage } = chatsSlice.actions;

export default chatsSlice.reducer;