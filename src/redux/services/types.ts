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
  id?: number | string;
  messageId?: string;
  content: string;
  senderId: number | string;
  receiverId?: number;
  conversationId?: string;
  timestamp?: string;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  isRead?: boolean;
  status?: 'sending' | 'sent' | 'error' | string;
  senderName?: string;
  isCurrentUserSender?: boolean;
  sender?: {
    id: string;
    username?: string;
    profile?: any;
  };
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

// Interface cho cuộc trò chuyện
export interface Conversation {
  conversationId: number | string;
  type: 'ONE-TO-ONE' | 'GROUP';
  groupName?: string;
  creatorId?: string;
  participantPairKey?: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
  partner?: {
    profile?: {
      lastName: string;
      firstName: string;
      avatar: string;
    }
  }


}

// Interface cho kết quả của việc tạo cuộc trò chuyện mới
export interface ConversationResponse {
  conversation: Conversation;
  message?: Message;
  isNew?: boolean;
  recipient?: User;
  error: string;
}