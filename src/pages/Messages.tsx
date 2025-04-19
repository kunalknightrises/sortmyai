import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMessageNotifications } from '@/contexts/MessageNotificationContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Inbox, MessageSquare } from 'lucide-react';
import { MessagePreview, Message } from '@/types/message';
import {
  getMessagePreviews,
  getMessages,
  sendMessage,
  markMessageAsRead,
  subscribeToMessages,
  acceptConversationRequest,
  rejectConversationRequest
} from '@/services/messageService';
import ConversationListItem from '@/components/messaging/ConversationListItem';
import MessageBubble from '@/components/messaging/MessageBubble';
import MessageInput from '@/components/messaging/MessageInput';
import EmptyState from '@/components/messaging/EmptyState';
// import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');

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

  // Function to load conversations
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

  // Load conversations and handle URL parameters
  useEffect(() => {
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

      // Check if this is a pending conversation where the current user is the requester
      const isPendingRequester = activeConversation.status === 'pending' && activeConversation.isRequester;

      // If it's a pending conversation and the user is the requester, show an error
      if (isPendingRequester) {
        toast({
          title: 'Cannot Send Message',
          description: 'Please wait for the recipient to accept your message request',
          variant: 'destructive'
        });
        setSendingMessage(false);
        return;
      }

      await sendMessage(
        activeConversation.conversationId,
        user.uid,
        activeConversation.participantId,
        content
      );
      setSendingMessage(false);

      // Refresh conversations list to update last message
      await loadConversations();
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

  // Handle accepting a message request
  const handleAcceptRequest = async (conversationId: string) => {
    try {
      await acceptConversationRequest(conversationId);
      toast({
        title: 'Request Accepted',
        description: 'You can now exchange messages with this user',
        variant: 'default'
      });
      // Refresh conversations
      loadConversations();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept message request',
        variant: 'destructive'
      });
    }
  };

  // Handle rejecting a message request
  const handleRejectRequest = async (conversationId: string) => {
    try {
      await rejectConversationRequest(conversationId);
      toast({
        title: 'Request Rejected',
        description: 'This user will not be able to message you',
        variant: 'default'
      });
      // Refresh conversations
      loadConversations();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject message request',
        variant: 'destructive'
      });
    }
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
  /* This function will be used in a future update
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
  }; */

  return (
    <div className="space-y-6">


      <GlassCard variant="bordered" className="border-sortmy-blue/20 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversation List */}
          {(showConversationList || !isMobileView) && (
            <div className="w-full md:w-1/3 border-r border-sortmy-blue/20 flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-sortmy-blue/20">
                <button
                  className={`flex items-center justify-center py-3 px-4 flex-1 ${activeTab === 'messages' ? 'border-b-2 border-sortmy-blue text-sortmy-blue' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('messages')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </button>
                <button
                  className={`flex items-center justify-center py-3 px-4 flex-1 ${activeTab === 'requests' ? 'border-b-2 border-sortmy-blue text-sortmy-blue' : 'text-gray-400'}`}
                  onClick={() => setActiveTab('requests')}
                >
                  <div className="relative">
                    <Inbox className="h-4 w-4 mr-2" />
                    {filteredConversations.filter(preview => preview.status === 'pending' && !preview.isRequester).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center"></span>
                    )}
                  </div>
                  Requests
                  {filteredConversations.filter(preview => preview.status === 'pending' && !preview.isRequester).length > 0 && (
                    <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                      {filteredConversations.filter(preview => preview.status === 'pending' && !preview.isRequester).length}
                    </span>
                  )}
                </button>
              </div>

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
                ) : (
                  activeTab === 'messages' ? (
                    // Regular Messages Tab
                    filteredConversations
                      .filter(preview => preview.status === 'accepted' || !preview.status)
                      .length === 0 ? (
                        <div className="p-4 text-center text-gray-400">
                          {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
                        </div>
                      ) : (
                        filteredConversations
                          .filter(preview => preview.status === 'accepted' || !preview.status)
                          .map((preview) => (
                            <ConversationListItem
                              key={preview.conversationId}
                              preview={preview}
                              isActive={activeConversation?.conversationId === preview.conversationId}
                              onClick={() => handleSelectConversation(preview)}
                            />
                          ))
                      )
                  ) : (
                    // Requests Tab
                    <>
                      {/* Pending requests that need action */}
                      {filteredConversations
                        .filter(preview => preview.status === 'pending' && !preview.isRequester)
                        .length === 0 &&
                        filteredConversations
                          .filter(preview => preview.status === 'pending' && preview.isRequester)
                          .length === 0 ? (
                          <div className="p-4 text-center text-gray-400">
                            No message requests
                          </div>
                        ) : null}

                      {/* Requests you've received */}
                      {filteredConversations
                        .filter(preview => preview.status === 'pending' && !preview.isRequester)
                        .map((preview) => (
                          <div key={preview.conversationId} className="relative">
                            <ConversationListItem
                              preview={preview}
                              isActive={activeConversation?.conversationId === preview.conversationId}
                              onClick={() => handleSelectConversation(preview)}
                            />
                            <div className="flex gap-2 mt-1 mb-3 ml-12">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-500"
                                onClick={() => handleAcceptRequest(preview.conversationId)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-500"
                                onClick={() => handleRejectRequest(preview.conversationId)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}

                      {/* Requests you've sent */}
                      {filteredConversations
                        .filter(preview => preview.status === 'pending' && preview.isRequester)
                        .map((preview) => (
                          <div key={preview.conversationId} className="relative">
                            <ConversationListItem
                              preview={preview}
                              isActive={activeConversation?.conversationId === preview.conversationId}
                              onClick={() => handleSelectConversation(preview)}
                            />
                            <div className="flex gap-2 mt-1 mb-3 ml-12">
                              <div className="text-xs text-yellow-500 flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Waiting for response
                              </div>
                            </div>
                          </div>
                        ))}
                    </>
                  )
                )}
              </div>
            </div>
          )}

          {/* Message Area */}
          <div className={`${isMobileView && showConversationList ? 'hidden' : 'flex'} flex-col w-full ${!isMobileView ? 'md:w-2/3' : ''}`}>
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-3 border-b border-sortmy-blue/20 flex items-center justify-between">
                  <div className="flex items-center">
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

                  {/* Show accept/reject buttons for pending requests */}
                  {activeConversation.status === 'pending' && !activeConversation.isRequester && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-500"
                        onClick={() => handleAcceptRequest(activeConversation.conversationId)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-500"
                        onClick={() => handleRejectRequest(activeConversation.conversationId)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {activeConversation.status === 'pending' ? (
                    <div className="flex flex-col h-full">
                      {/* Show the first message */}
                      {messages.length > 0 && (
                        <div className="flex-1 overflow-y-auto mb-4">
                          {messages.map((message) => (
                            <MessageBubble
                              key={message.id}
                              message={message}
                              isCurrentUser={message.senderId === user?.uid}
                              senderAvatar={message.senderId === user?.uid ? user?.avatar_url : otherUser?.avatar_url}
                              senderName={message.senderId === user?.uid ? user?.username : otherUser?.username}
                            />
                          ))}
                        </div>
                      )}

                      {/* Message request notification */}
                      <div className="flex flex-col items-center justify-center text-center p-6 bg-sortmy-blue/5 rounded-lg border border-sortmy-blue/20">
                        {activeConversation.isRequester ? (
                          <>
                            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Waiting for Response</h3>
                            <p className="text-gray-400 mb-4">
                              Your message has been sent. You'll be able to continue the conversation once {activeConversation.participantName} accepts your request.
                            </p>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-12 w-12 text-blue-500 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Message Request</h3>
                            <p className="text-gray-400 mb-4">
                              {activeConversation.participantName} sent you a message. Accept to continue the conversation.
                            </p>
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                className="bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-500"
                                onClick={() => handleAcceptRequest(activeConversation.conversationId)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Request
                              </Button>
                              <Button
                                variant="outline"
                                className="bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-500"
                                onClick={() => handleRejectRequest(activeConversation.conversationId)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Decline Request
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
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

                {/* Message Input - Show for accepted conversations or for the first message */}
                {(activeConversation.status === 'accepted' || !activeConversation.status || (activeConversation.status === 'pending' && !activeConversation.isRequester)) && (
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    isLoading={sendingMessage}
                  />
                )}
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
