import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMessageNotifications } from '@/contexts/MessageNotificationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessagePreview, Message } from '@/types/message';
import {
  getMessagePreviews,
  getMessages,
  sendMessage,
  markMessageAsRead,
  subscribeToMessages,
  getOrCreateConversation
} from '@/services/messageService';
import ConversationListItem from '@/components/messaging/ConversationListItem';
import MessageBubble from '@/components/messaging/MessageBubble';
import MessageInput from '@/components/messaging/MessageInput';
import EmptyState from '@/components/messaging/EmptyState';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, ArrowLeft } from 'lucide-react';
import { User } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import GlassCard from '@/components/ui/GlassCard';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { clearNotificationsForConversation } = useMessageNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<MessagePreview[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<MessagePreview | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showConversationList, setShowConversationList] = useState(true);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowConversationList(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversations and handle URL parameters
  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const previews = await getMessagePreviews(user.uid);
        setConversations(previews);

        // Check for conversation ID in URL parameters
        const params = new URLSearchParams(location.search);
        const conversationId = params.get('conversation');

        if (conversationId) {
          // Find the conversation in the loaded previews
          const conversation = previews.find(p => p.conversationId === conversationId);

          if (conversation) {
            // Select the conversation
            handleSelectConversation(conversation);
            // Remove the parameter from the URL
            navigate('/dashboard/messages', { replace: true });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversations',
          variant: 'destructive'
        });
        setLoading(false);
      }
    };

    loadConversations();
  }, [user, toast, location.search, navigate]);

  // Subscribe to messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        const msgs = await getMessages(activeConversation.conversationId);
        setMessages(msgs);

        // Mark unread messages as read
        msgs.forEach(msg => {
          if (!msg.read && msg.receiverId === user?.uid) {
            markMessageAsRead(activeConversation.conversationId, msg.id);
          }
        });

        // Scroll to bottom
        scrollToBottom();
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive'
        });
      }
    };

    // Load initial messages
    loadMessages();

    // Subscribe to new messages
    const unsubscribe = subscribeToMessages(
      activeConversation.conversationId,
      (updatedMessages) => {
        setMessages(updatedMessages);

        // Mark new messages as read
        updatedMessages.forEach(msg => {
          if (!msg.read && msg.receiverId === user?.uid) {
            markMessageAsRead(activeConversation.conversationId, msg.id);
          }
        });

        // Scroll to bottom for new messages
        scrollToBottom();
      }
    );

    // Load other user details
    const loadOtherUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', activeConversation.participantId));
        if (userDoc.exists()) {
          setOtherUser(userDoc.data() as User);
        }
      } catch (error) {
        console.error('Error loading user details:', error);
      }
    };

    loadOtherUser();

    return () => {
      unsubscribe();
    };
  }, [activeConversation, user, toast]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!user || !activeConversation) return;

    try {
      setSendingMessage(true);
      await sendMessage(
        activeConversation.conversationId,
        user.uid,
        activeConversation.participantId,
        content
      );
      setSendingMessage(false);

      // Refresh conversations list to update last message
      const previews = await getMessagePreviews(user.uid);
      setConversations(previews);
    } catch (error) {
      console.error('Error sending message:', error);

      // Show a more descriptive error message
      let errorMessage = 'Failed to send message';
      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please try again later.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }

      toast({
        title: 'Message Not Sent',
        description: errorMessage,
        variant: 'destructive'
      });
      setSendingMessage(false);
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: MessagePreview) => {
    setActiveConversation(conversation);
    if (isMobileView) {
      setShowConversationList(false);
    }

    // Clear notifications for this conversation
    clearNotificationsForConversation(conversation.conversationId);
  };

  // Handle back button in mobile view
  const handleBackToList = () => {
    setShowConversationList(true);
    setActiveConversation(null);
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter(
    conv => conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Start a new conversation with a user
  const startNewConversation = async (userId: string) => {
    if (!user) return;

    try {
      const conversationId = await getOrCreateConversation(user.uid, userId);

      // Refresh conversations and select the new one
      const previews = await getMessagePreviews(user.uid);
      setConversations(previews);

      const newConversation = previews.find(p => p.conversationId === conversationId);
      if (newConversation) {
        handleSelectConversation(newConversation);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text flex items-center">
          Messages
        </h1>
      </div>

      <GlassCard variant="bordered" className="border-sortmy-blue/20 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversation List */}
          {(showConversationList || !isMobileView) && (
            <div className="w-full md:w-1/3 border-r border-sortmy-blue/20 flex flex-col">
              <div className="p-3 border-b border-sortmy-blue/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9 bg-sortmy-dark/50 border-sortmy-blue/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-400">Loading conversations...</div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <ConversationListItem
                      key={conversation.conversationId}
                      preview={conversation}
                      isActive={activeConversation?.conversationId === conversation.conversationId}
                      onClick={() => handleSelectConversation(conversation)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Message Area */}
          <div className={`${isMobileView && showConversationList ? 'hidden' : 'flex'} flex-col w-full ${!isMobileView ? 'md:w-2/3' : ''}`}>
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-3 border-b border-sortmy-blue/20 flex items-center">
                  {isMobileView && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-2"
                      onClick={handleBackToList}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <div className="font-medium">{activeConversation.participantName}</div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <EmptyState
                      title="No messages yet"
                      description="Start the conversation by sending a message below."
                    />
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isCurrentUser={message.senderId === user?.uid}
                        senderAvatar={message.senderId === user?.uid ? user?.avatar_url : otherUser?.avatar_url}
                        senderName={message.senderId === user?.uid ? user?.username : otherUser?.username}
                      />
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <MessageInput
                  onSendMessage={handleSendMessage}
                  isLoading={sendingMessage}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Messages;
