import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getOrCreateConversation } from '@/services/messageService';
import ClickEffect from '@/components/ui/ClickEffect';

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

  const handleClick = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to message creators',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    try {
      // Don't allow messaging yourself
      if (user.uid === userId) {
        toast({
          title: 'Cannot message yourself',
          description: 'You cannot send messages to yourself',
          variant: 'destructive'
        });
        return;
      }

      // Create or get conversation
      const conversationId = await getOrCreateConversation(user.uid, userId);
      
      // Navigate to messages page
      navigate('/dashboard/messages', { 
        state: { 
          conversationId,
          participantId: userId,
          participantName: username
        } 
      });
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
    <ClickEffect effect="ripple" color="blue">
      <Button
        variant={variant as any}
        size={size}
        className={className}
        onClick={handleClick}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Message
      </Button>
    </ClickEffect>
  );
};

export default MessageButton;
