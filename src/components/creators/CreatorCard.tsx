import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ExternalLink, Users, Lock, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HoverEffect from '@/components/ui/HoverEffect';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MessageButton from '@/components/messaging/MessageButton';

interface CreatorCardProps {
  creator: User;
}

export const CreatorCard = ({ creator }: CreatorCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getInitials = () => {
    if (!creator || !creator.username) return 'U';
    return creator.username.substring(0, 2).toUpperCase();
  };

  const handleFollowClick = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to follow creators",
        variant: "default"
      });
      navigate('/signup');
      return;
    }

    // Follow functionality would be implemented here
    toast({
      title: "Following " + creator.username,
      description: "You are now following this creator",
      variant: "success"
    });
  };

  return (
    <HoverEffect effect="lift" className="h-full">
      <Card className="bg-sortmy-dark/50 border-sortmy-blue/20 backdrop-blur-md h-full flex flex-col">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <Avatar className="h-24 w-24 mb-4 border-2 border-sortmy-blue/20">
            <AvatarImage src={creator.avatar_url} />
            <AvatarFallback className="text-xl bg-sortmy-blue/20 text-sortmy-blue">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">
            {creator.username}
            {creator.is_premium && (
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1 text-xs text-white" title="Verified Creator">
                ✓
              </span>
            )}
          </h3>

          <p className="text-gray-300 text-sm mb-2">
            {creator.profession || 'AI Content Creator'}
          </p>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {creator.bio || 'Creating the future with AI.'}
          </p>

          <div className="flex justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="font-bold">{creator.followers_count || 0}</div>
              <div className="text-xs text-gray-400">followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{creator.following_count || 0}</div>
              <div className="text-xs text-gray-400">following</div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center gap-2 mt-auto">
          <ClickEffect effect="ripple" color="blue">
            <Link to={`/portfolio/${creator.username}`}>
              <NeonButton variant="cyan" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Portfolio
              </NeonButton>
            </Link>
          </ClickEffect>
          <MessageButton
            userId={creator.uid}
            username={creator.username || ''}
            variant="outline"
            size="sm"
          />
          <ClickEffect effect="ripple" color="blue">
            <NeonButton
              variant="magenta"
              size="sm"
              onClick={handleFollowClick}
            >
              {!user ? <Lock className="w-3 h-3 mr-1" /> : null}
              <Users className="w-4 h-4 mr-2" />
              Follow
            </NeonButton>
          </ClickEffect>
        </CardFooter>
      </Card>
    </HoverEffect>
  );
};
