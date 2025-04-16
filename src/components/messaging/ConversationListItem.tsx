import React from 'react';
import { MessagePreview } from '@/types/message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationListItemProps {
  preview: MessagePreview;
  isActive: boolean;
  onClick: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  preview,
  isActive,
  onClick
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formattedTime = formatDistanceToNow(new Date(preview.timestamp), { addSuffix: true });

  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
        isActive 
          ? "bg-sortmy-blue/10 border-l-2 border-sortmy-blue" 
          : "hover:bg-sortmy-blue/5",
        preview.unreadCount > 0 && !isActive ? "bg-sortmy-blue/5" : ""
      )}
      onClick={onClick}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={preview.participantAvatar} />
        <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue">
          {getInitials(preview.participantName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-white truncate">{preview.participantName}</h4>
          <span className="text-xs text-gray-400">{formattedTime}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-300 truncate">{preview.lastMessage}</p>
          
          {preview.unreadCount > 0 && (
            <span className="bg-sortmy-blue text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
              {preview.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;
