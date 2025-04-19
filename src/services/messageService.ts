import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { showNotification } from './notificationService';
import { db } from '@/lib/firebase';
import { Message, Conversation, MessagePreview } from '@/types/message';
import { User } from '@/types';

// Create a new conversation
export const createConversation = async (participants: string[], requesterId: string): Promise<string> => {
  try {
    const conversationRef = await addDoc(collection(db, 'conversations'), {
      participants,
      status: 'pending', // Start as a pending conversation
      requesterId, // Store who initiated the conversation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return conversationRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Get or create a conversation between two users
export const getOrCreateConversation = async (userId1: string, userId2: string): Promise<string> => {
  try {
    // Check if conversation already exists
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId1)
    );

    const querySnapshot = await getDocs(q);

    // Find conversation with both participants
    let conversationId: string | null = null;
    let conversationStatus: string | null = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(userId2)) {
        conversationId = doc.id;
        conversationStatus = data.status;
      }
    });

    // If conversation exists and is not rejected, return its ID
    if (conversationId && conversationStatus !== 'rejected') {
      return conversationId;
    }

    // Otherwise, create a new conversation
    return await createConversation([userId1, userId2], userId1);
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    // Create a more descriptive error message
    if (error instanceof Error) {
      throw new Error(`Failed to get or create conversation: ${error.message}`);
    } else {
      throw new Error('Failed to get or create conversation due to an unknown error');
    }
  }
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string,
  attachmentUrl?: string,
  attachmentType?: 'image' | 'file'
): Promise<string> => {
  try {
    const timestamp = new Date().toISOString();
    const serverTime = serverTimestamp();

    // Get conversation to check if this is the first message
    const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
    const conversationData = conversationDoc.data();
    const isFirstMessage = !conversationData?.lastMessage;

    // Create message
    const messageRef = await addDoc(
      collection(db, 'conversations', conversationId, 'messages'),
      {
        conversationId,
        senderId,
        receiverId,
        content,
        timestamp,
        serverTime,
        read: false,
        ...(attachmentUrl && { attachmentUrl }),
        ...(attachmentType && { attachmentType })
      }
    );

    // Update conversation with last message
    const conversationRef = doc(db, 'conversations', conversationId);

    // If this is the first message, set status to pending and store requester
    if (isFirstMessage) {
      await updateDoc(conversationRef, {
        lastMessage: {
          content,
          timestamp,
          senderId
        },
        status: 'pending',
        requesterId: senderId,
        updatedAt: timestamp,
        serverTime: serverTime
      });
    } else {
      // Regular message update
      await updateDoc(conversationRef, {
        lastMessage: {
          content,
          timestamp,
          senderId
        },
        updatedAt: timestamp,
        serverTime: serverTime
      });
    }

    try {
      // Get sender information for notification
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.data() as User;
      const senderName = senderData?.username || 'Someone';

      // Show notification in the browser if it's not the current user
      if (typeof window !== 'undefined') {
        // Show notification for the receiver
        showNotification(`New message from ${senderName}`, {
          body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          data: {
            url: `/dashboard/messages?conversation=${conversationId}`,
            senderId,
            conversationId
          }
        });
      }
    } catch (error) {
      // Just log the error but don't fail the message sending
      console.warn('Error showing notification:', error);
    }

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    // Create a more descriptive error message
    if (error instanceof Error) {
      throw new Error(`Failed to send message: ${error.message}`);
    } else {
      throw new Error('Failed to send message due to an unknown error');
    }
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);

    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      } as Message);
    });

    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

// Subscribe to messages for a conversation
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages: Message[] = [];
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      } as Message);
    });

    callback(messages);
  });
};

// Get conversations for a user
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const conversations: Conversation[] = [];
    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      } as Conversation);
    });

    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

// Subscribe to conversations for a user
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const conversations: Conversation[] = [];
    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data()
      } as Conversation);
    });

    callback(conversations);
  });
};

// Mark message as read
export const markMessageAsRead = async (conversationId: string, messageId: string): Promise<void> => {
  try {
    await updateDoc(
      doc(db, 'conversations', conversationId, 'messages', messageId),
      { read: true }
    );
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Get conversation previews with user details
export const getMessagePreviews = async (userId: string): Promise<MessagePreview[]> => {
  try {
    // Get all conversations for the user
    const conversations = await getConversations(userId);

    // Get user details for each conversation
    const previews: MessagePreview[] = await Promise.all(
      conversations.map(async (conversation) => {
        // Get the other participant's ID
        const participantId = conversation.participants.find(id => id !== userId) || '';

        // Get user details
        const userDoc = await getDoc(doc(db, 'users', participantId));
        const userData = userDoc.data() as User;

        // Count unread messages
        const messagesQuery = query(
          collection(db, 'conversations', conversation.id, 'messages'),
          where('receiverId', '==', userId),
          where('read', '==', false)
        );
        const unreadSnapshot = await getDocs(messagesQuery);

        // Get last message content
        let lastMessageContent = '';
        if (conversation.lastMessage?.content) {
          lastMessageContent = conversation.lastMessage.content;
        } else {
          // If no last message, check if it's a pending request
          if (conversation.status === 'pending') {
            lastMessageContent = conversation.requesterId === userId
              ? 'You sent a message request'
              : 'Sent you a message request';
          } else {
            lastMessageContent = 'No messages yet';
          }
        }

        return {
          conversationId: conversation.id,
          participantId,
          participantName: userData?.username || userData?.displayName || 'User',
          participantAvatar: userData?.avatar_url || userData?.photoURL,
          lastMessage: lastMessageContent,
          timestamp: conversation.lastMessage?.timestamp || conversation.updatedAt,
          unreadCount: unreadSnapshot.size,
          status: conversation.status || 'accepted', // Default to accepted for backward compatibility
          isRequester: conversation.requesterId === userId
        };
      })
    );

    // Sort by timestamp (newest first)
    return previews.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting message previews:', error);
    throw error;
  }
};

// Accept a conversation request
export const acceptConversationRequest = async (conversationId: string): Promise<void> => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      status: 'accepted',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error accepting conversation request:', error);
    throw error;
  }
};

// Reject a conversation request
export const rejectConversationRequest = async (conversationId: string): Promise<void> => {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      status: 'rejected',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error rejecting conversation request:', error);
    throw error;
  }
};