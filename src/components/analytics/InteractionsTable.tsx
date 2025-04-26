import React from 'react';
import { UserInteractionSummary } from '@/types/analytics';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Eye, ThumbsUp, MessageSquare, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface InteractionsTableProps {
  users: UserInteractionSummary[];
  interactionType: 'view' | 'like' | 'comment';
  onViewProfile: (userId: string) => void;
}

const InteractionsTable: React.FC<InteractionsTableProps> = ({
  users,
  interactionType,
  onViewProfile
}) => {
  const getInteractionIcon = () => {
    switch (interactionType) {
      case 'view':
        return <Eye className="h-4 w-4 text-[#00ffff]" />;
      case 'like':
        return <ThumbsUp className="h-4 w-4 text-[#ff00cc]" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-[#ffa500]" />;
      default:
        return null;
    }
  };

  const getInteractionLabel = () => {
    switch (interactionType) {
      case 'view':
        return 'Views';
      case 'like':
        return 'Likes';
      case 'comment':
        return 'Comments';
      default:
        return 'Interactions';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-sortmy-blue/20 hover:bg-transparent">
            <TableHead className="w-[250px]">User</TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center">
                {getInteractionIcon()}
                <span className="ml-2">{getInteractionLabel()}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">Last Interaction</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow 
              key={user.userId} 
              className="border-b border-sortmy-blue/10 hover:bg-sortmy-blue/5 cursor-pointer"
              onClick={() => onViewProfile(user.userId)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue text-xs">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.username || 'Unknown User'}</div>
                    <div className="text-xs text-gray-400">{user.displayName}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="font-medium">{user.interactionCount}</div>
              </TableCell>
              <TableCell className="text-center">
                <div className="text-sm text-gray-400">
                  {formatDistanceToNow(parseISO(user.lastInteraction), { addSuffix: true })}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile(user.userId);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">View Profile</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InteractionsTable;
