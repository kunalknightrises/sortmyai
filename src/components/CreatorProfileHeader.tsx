import { MessageSquare, Users, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, PortfolioItem } from '@/types';

interface CreatorProfileHeaderProps {
  user: User | null;
  portfolio: PortfolioItem[];
}

const CreatorProfileHeader = ({ user, portfolio }: CreatorProfileHeaderProps) => {
  if (!user) return null;
  
  const getInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  };
  
  const postCount = portfolio.length;
  const totalLikes = portfolio.reduce((acc, item) => acc + item.likes, 0);
  
  return (
    <div className="py-8 border-b border-sortmy-gray/30">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Avatar */}
        <Avatar className="h-24 w-24 md:h-36 md:w-36 border-2 border-sortmy-blue/20">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback className="text-xl bg-sortmy-blue/20 text-sortmy-blue">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {/* Profile Info */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-bold">
              {user.username}
              {user.is_premium && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1 text-xs text-white" title="Verified Creator">
                  ✓
                </span>
              )}
            </h1>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
              <Button size="sm" className="gap-2 bg-sortmy-blue hover:bg-sortmy-blue/90">
                <Users className="w-4 h-4" />
                Follow
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-6">
            <div className="text-center">
              <div className="font-bold">{postCount}</div>
              <div className="text-xs text-gray-400">posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold">1.4K</div>
              <div className="text-xs text-gray-400">followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">284</div>
              <div className="text-xs text-gray-400">following</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{totalLikes}</div>
              <div className="text-xs text-gray-400">likes</div>
            </div>
          </div>
          
          {/* Bio */}
          <div>
            <h2 className="font-medium">AI Content Creator</h2>
            <p className="text-sm text-gray-300 mt-1">Creating the future with AI. Specializing in digital avatars, AI art, voice cloning, and prompt engineering.</p>
            <p className="text-sm text-sortmy-blue mt-1">sortmy.ai/{user.username}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfileHeader;
