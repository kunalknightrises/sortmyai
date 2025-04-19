import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { getMessagePreviews } from '@/services/messageService';
import { MessagePreview } from '@/types/message';

interface MessageNotificationContextType {
  unreadCount: number;
  totalUnreadMessages: number;
  pendingRequestsCount: number;
  refreshUnreadCount: () => Promise<void>;
  messageNotifications: MessagePreview[];
  clearNotificationsForConversation: (conversationId: string) => void;
}

const MessageNotificationContext = createContext<MessageNotificationContextType | undefined>(undefined);

export const useMessageNotifications = () => {
  const context = useContext(MessageNotificationContext);
  if (context === undefined) {
    throw new Error('useMessageNotifications must be used within a MessageNotificationProvider');
  }
  return context;
};

export const MessageNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageNotifications, setMessageNotifications] = useState<MessagePreview[]>([]);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Function to refresh unread count
  const refreshUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      setMessageNotifications([]);
      setTotalUnreadMessages(0);
      return;
    }

    try {
      const previews = await getMessagePreviews(user.uid);
      const unreadPreviews = previews.filter(preview => preview.unreadCount > 0);
      const pendingRequests = previews.filter(preview => preview.status === 'pending' && !preview.isRequester);

      setMessageNotifications(unreadPreviews);
      setUnreadCount(unreadPreviews.length);
      setTotalUnreadMessages(
        unreadPreviews.reduce((total, preview) => total + preview.unreadCount, 0)
      );
      setPendingRequestsCount(pendingRequests.length);
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  };

  // Clear notifications for a specific conversation
  const clearNotificationsForConversation = (conversationId: string) => {
    setMessageNotifications(prev =>
      prev.filter(notification => notification.conversationId !== conversationId)
    );

    // Recalculate counts
    const updatedNotifications = messageNotifications.filter(
      notification => notification.conversationId !== conversationId
    );

    setUnreadCount(updatedNotifications.length);
    setTotalUnreadMessages(
      updatedNotifications.reduce((total, preview) => total + preview.unreadCount, 0)
    );
  };

  // Listen for new messages
  useEffect(() => {
    if (!user) return;

    // Set up a listener for all conversations where the user is a participant
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(conversationsQuery, () => {
      // When any conversation updates, refresh the unread count
      refreshUnreadCount();
    });

    // Initial load
    refreshUnreadCount();

    return () => unsubscribe();
  }, [user]);

  return (
    <MessageNotificationContext.Provider
      value={{
        unreadCount,
        totalUnreadMessages,
        pendingRequestsCount,
        refreshUnreadCount,
        messageNotifications,
        clearNotificationsForConversation
      }}
    >
      {children}
    </MessageNotificationContext.Provider>
  );
};
