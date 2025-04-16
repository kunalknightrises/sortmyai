export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'file';
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MessagePreview {
  conversationId: string;
  participantId: string; // The other user in the conversation
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}
