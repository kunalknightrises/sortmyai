import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, UserCheck, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getPostLikesWithUsers } from '@/services/interactionService';
import { LikeWithUser } from '@/types/interactions';
import { Link } from 'react-router-dom';
import { followCreator, unfollowCreator, checkIfFollowing } from '@/services/followService';

interface LikesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  likeCount: number;
}

const LikesModal: React.FC<LikesModalProps> = ({
  isOpen,
  onClose,
  postId,
  likeCount
}) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [likes, setLikes] = useState<LikeWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});

  // Fetch likes
  useEffect(() => {
    if (!isOpen) return;

    const fetchLikes = async () => {
      setLoading(true);
      try {
        const likesData = await getPostLikesWithUsers(postId);
        setLikes(likesData);

        // Check follow status for current user
        if (currentUser) {
          const statusMap: Record<string, boolean> = {};
          
          await Promise.all(
            likesData.map(async (like) => {
              if (like.userId !== currentUser.uid) {
                statusMap[like.userId] = await checkIfFollowing(currentUser.uid, like.userId);
              }
            })
          );
          
          setFollowStatus(statusMap);
        }
      } catch (error) {
        console.error('Error fetching likes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load likes',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [isOpen, postId, currentUser, toast]);

  const handleFollowToggle = async (targetUserId: string, targetUsername: string) => {
    if (!currentUser) return;
    
    setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
    
    try {
      const isFollowing = followStatus[targetUserId];
      
      if (isFollowing) {
        await unfollowCreator(currentUser.uid, targetUserId);
        toast({
          title: `Unfollowed ${targetUsername}`,
          description: `You are no longer following ${targetUsername}`,
          variant: 'default'
        });
      } else {
        await followCreator(currentUser.uid, targetUserId);
        toast({
          title: `Following ${targetUsername}`,
          description: `You are now following ${targetUsername}`,
          variant: 'success'
        });
      }
      
      // Update follow status
      setFollowStatus(prev => ({
        ...prev,
        [targetUserId]: !isFollowing
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-sortmy-dark border-sortmy-blue/20">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Likes ({likeCount})
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-sortmy-blue" />
            </div>
          ) : likes.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No likes yet
            </div>
          ) : (
            <div className="space-y-4">
              {likes.map((like) => (
                <div key={like.id} className="flex items-center justify-between">
                  <Link 
                    to={`/portfolio/${like.user.username}`} 
                    className="flex items-center gap-3 hover:text-sortmy-blue transition-colors"
                  >
                    <Avatar className="h-10 w-10 border border-sortmy-blue/20">
                      <AvatarImage src={like.user.avatar_url} />
                      <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue">
                        {getInitials(like.user.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{like.user.username || 'Unknown User'}</div>
                      <div className="text-xs text-gray-400">{like.user.profession || 'AI Creator'}</div>
                    </div>
                  </Link>
                  
                  {currentUser && currentUser.uid !== like.userId && (
                    <Button
                      size="sm"
                      variant={followStatus[like.userId] ? "outline" : "default"}
                      className={followStatus[like.userId] ? "border-sortmy-blue/50" : "bg-sortmy-blue"}
                      onClick={() => handleFollowToggle(like.userId, like.user.username || '')}
                      disabled={followLoading[like.userId]}
                    >
                      {followLoading[like.userId] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : followStatus[like.userId] ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-1" />
                          Following
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LikesModal;
