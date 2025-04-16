import React from 'react';
import { Message } from '@/types/message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  senderAvatar?: string;
  senderName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  senderAvatar,
  senderName
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formattedTime = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });

  return (
    <div className={cn(
      "flex items-start gap-2 mb-4",
      isCurrentUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={senderAvatar} />
        <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue text-xs">
          {senderName ? getInitials(senderName) : 'U'}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "max-w-[70%] rounded-lg p-3 shadow-sm",
        isCurrentUser 
          ? "bg-sortmy-blue text-white rounded-tr-none" 
          : "bg-sortmy-dark/50 border border-sortmy-blue/20 rounded-tl-none"
      )}>
        {message.content}
        
        {message.attachmentUrl && message.attachmentType === 'image' && (
          <div className="mt-2">
            <img 
              src={message.attachmentUrl} 
              alt="Attachment" 
              className="rounded-md max-w-full max-h-60 object-contain"
            />
          </div>
        )}
        
        {message.attachmentUrl && message.attachmentType === 'file' && (
          <div className="mt-2">
            <a 
              href={message.attachmentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm flex items-center gap-1 text-sortmy-blue underline"
            >
              Attachment
            </a>
          </div>
        )}
        
        <div className={cn(
          "text-xs mt-1",
          isCurrentUser ? "text-blue-100" : "text-gray-400"
        )}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
