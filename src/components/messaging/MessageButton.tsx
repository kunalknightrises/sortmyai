import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getOrCreateConversation, sendMessage } from '@/services/messageService';
import ClickEffect from '@/components/ui/ClickEffect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface MessageButtonProps {
  userId: string;
  username: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary' | 'cyan' | 'gradient';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const MessageButton: React.FC<MessageButtonProps> = ({
  userId,
  username,
  variant = 'cyan',
  size = 'default',
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');

  const handleClick = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to message creators',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    // Don't allow messaging yourself
    if (user.uid === userId) {
      toast({
        title: 'Cannot message yourself',
        description: 'You cannot send messages to yourself',
        variant: 'destructive'
      });
      return;
    }

    // Open the message dialog
    setShowMessageDialog(true);
  };

  // Handle sending the first message
  const handleSendFirstMessage = async () => {
    if (!messageContent.trim()) {
      toast({
        title: 'Empty Message',
        description: 'Please enter a message',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create or get conversation
      if (!user) {
        throw new Error('User not authenticated');
      }

      const conversationId = await getOrCreateConversation(user.uid, userId);

      // Send the first message
      await sendMessage(
        conversationId,
        user.uid,
        userId,
        messageContent
      );

      // Show success message
      toast({
        title: 'Message Sent',
        description: `Your message has been sent to ${username}`,
        variant: 'default'
      });

      // Close dialog
      setShowMessageDialog(false);
      setMessageContent('');

      // Navigate to messages page
      navigate('/dashboard/messages', {
        state: {
          conversationId,
          participantId: userId,
          participantName: username
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ClickEffect effect="ripple" color="blue">
        <Button
          variant={variant as any}
          size={size}
          className={className}
          onClick={handleClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </>
          )}
        </Button>
      </ClickEffect>

      {/* First Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-[500px] bg-sortmy-dark border-sortmy-blue/20">
          <DialogHeader>
            <DialogTitle>Send a message to {username}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-400 mb-4">
              {username} will need to accept your message request before you can continue the conversation.
            </p>
            <Textarea
              placeholder="Write your message here..."
              className="min-h-[100px] bg-sortmy-dark/50 border-sortmy-blue/20 focus:border-sortmy-blue/50"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMessageDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendFirstMessage}
              disabled={isLoading || !messageContent.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageButton;
