// Common type definitions

export interface User {
  id: string;
  profile: {
    lastName: string;
    firstName: string;
    avatar: string;
  };
  username: string;
  isContact: boolean;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId?: number;
  timestamp: string;
  isRead: boolean;
  status?: 'sending' | 'sent' | 'error';
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
  messages?: Message[];
}

export interface VerificationResponse {
  success: boolean;
  message: string;
}