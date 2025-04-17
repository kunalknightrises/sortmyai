import { useState, useEffect } from 'react';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ExternalLink, Users, Lock, UserCheck, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HoverEffect from '@/components/ui/HoverEffect';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { followCreator, unfollowCreator, checkIfFollowing } from '@/services/followService';

interface CreatorCardProps {
  creator: User;
}

export const CreatorCard = ({ creator }: CreatorCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(creator.followers_count || 0);

  // Check if the user is following this creator
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user) return;

      try {
        const following = await checkIfFollowing(user.uid, creator.uid);
        setIsFollowing(following);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [user, creator.uid]);

  const getInitials = () => {
    if (!creator || !creator.username) return 'U';
    return creator.username.substring(0, 2).toUpperCase();
  };

  const handleFollowClick = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "You need to sign in to follow creators",
        variant: "default"
      });
      navigate('/signup');
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow the creator
        await unfollowCreator(user.uid, creator.uid);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast({
          title: "Unfollowed " + creator.username,
          description: "You are no longer following this creator",
          variant: "default"
        });
      } else {
        // Follow the creator
        await followCreator(user.uid, creator.uid);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({
          title: "Following " + creator.username,
          description: "You are now following this creator",
          variant: "success"
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing creator:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
              <div className="font-bold">{followerCount}</div>
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
          <ClickEffect effect="ripple" color="blue">
            <NeonButton
              variant={isFollowing ? "outline" : "magenta"}
              size="sm"
              onClick={handleFollowClick}
              disabled={isLoading}
            >
              {!user ? (
                <Lock className="w-3 h-3 mr-1" />
              ) : isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isFollowing ? (
                <UserCheck className="w-4 h-4 mr-2" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              {isFollowing ? "Following" : "Follow"}
            </NeonButton>
          </ClickEffect>
        </CardFooter>
      </Card>
    </HoverEffect>
  );
};
