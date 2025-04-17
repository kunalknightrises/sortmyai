import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import { Loader2, UserCheck, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
// These imports are used in the followService, not directly here
import { getFollowersWithDetails, getFollowingWithDetails, followCreator, unfollowCreator, checkIfFollowing } from '@/services/followService';
import { Link } from 'react-router-dom';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  initialTab?: 'followers' | 'following';
  followerCount: number;
  followingCount: number;
}

export default function FollowersModal({
  isOpen,
  onClose,
  userId,
  username,
  initialTab = 'followers',
  followerCount,
  followingCount
}: FollowersModalProps) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});

  // Fetch followers and following
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Fetch followers with details
        const followerUsers = await getFollowersWithDetails(userId);
        setFollowers(followerUsers);

        // Fetch following with details
        const followingUsers = await getFollowingWithDetails(userId);
        setFollowing(followingUsers);

        // Check follow status for current user
        if (currentUser) {
          const allUserIds = [...new Set([
            ...followerUsers.map(user => user.uid || user.id),
            ...followingUsers.map(user => user.uid || user.id)
          ])];

          const statusMap: Record<string, boolean> = {};

          await Promise.all(
            allUserIds.map(async (id) => {
              if (id !== currentUser.uid) {
                statusMap[id] = await checkIfFollowing(currentUser.uid, id);
              }
            })
          );

          setFollowStatus(statusMap);
        }
      } catch (error) {
        console.error('Error fetching followers/following:', error);
        toast({
          title: 'Error',
          description: 'Failed to load followers or following',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, currentUser, toast]);

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

      // Refresh the followers/following lists
      if (userId === currentUser.uid) {
        // If this is the current user's modal, refresh the lists
        const updatedFollowing = await getFollowingWithDetails(userId);
        setFollowing(updatedFollowing);
      }
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
          <DialogTitle className="text-center">{username}'s Connections</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as 'followers' | 'following')}>
          <TabsList className="grid w-full grid-cols-2 bg-sortmy-darker">
            <TabsTrigger value="followers" className="data-[state=active]:bg-sortmy-blue/20">
              Followers ({followerCount})
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-sortmy-blue/20">
              Following ({followingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-sortmy-blue" />
              </div>
            ) : followers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No followers yet
              </div>
            ) : (
              <div className="space-y-4">
                {followers.map((follower) => (
                  <div key={follower.id} className="flex items-center justify-between">
                    <Link
                      to={`/portfolio/${follower.username}`}
                      className="flex items-center gap-3 hover:text-sortmy-blue transition-colors"
                    >
                      <Avatar className="h-10 w-10 border border-sortmy-blue/20">
                        <AvatarImage src={follower.avatar_url} />
                        <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue">
                          {getInitials(follower.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{follower.username}</div>
                        <div className="text-xs text-gray-400">{follower.profession || 'AI Creator'}</div>
                      </div>
                    </Link>

                    {currentUser && currentUser.uid !== (follower.uid || follower.id) && (
                      <Button
                        size="sm"
                        variant={followStatus[follower.uid || follower.id] ? "outline" : "default"}
                        className={followStatus[follower.uid || follower.id] ? "border-sortmy-blue/50" : "bg-sortmy-blue"}
                        onClick={() => handleFollowToggle(follower.uid || follower.id, follower.username || '')}
                        disabled={followLoading[follower.uid || follower.id]}
                      >
                        {followLoading[follower.uid || follower.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : followStatus[follower.uid || follower.id] ? (
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
          </TabsContent>

          <TabsContent value="following" className="mt-4 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-sortmy-blue" />
              </div>
            ) : following.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                Not following anyone yet
              </div>
            ) : (
              <div className="space-y-4">
                {following.map((followedUser) => (
                  <div key={followedUser.id} className="flex items-center justify-between">
                    <Link
                      to={`/portfolio/${followedUser.username}`}
                      className="flex items-center gap-3 hover:text-sortmy-blue transition-colors"
                    >
                      <Avatar className="h-10 w-10 border border-sortmy-blue/20">
                        <AvatarImage src={followedUser.avatar_url} />
                        <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue">
                          {getInitials(followedUser.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{followedUser.username}</div>
                        <div className="text-xs text-gray-400">{followedUser.profession || 'AI Creator'}</div>
                      </div>
                    </Link>

                    {currentUser && currentUser.uid !== (followedUser.uid || followedUser.id) && (
                      <Button
                        size="sm"
                        variant={followStatus[followedUser.uid || followedUser.id] ? "outline" : "default"}
                        className={followStatus[followedUser.uid || followedUser.id] ? "border-sortmy-blue/50" : "bg-sortmy-blue"}
                        onClick={() => handleFollowToggle(followedUser.uid || followedUser.id, followedUser.username || '')}
                        disabled={followLoading[followedUser.uid || followedUser.id]}
                      >
                        {followLoading[followedUser.uid || followedUser.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : followStatus[followedUser.uid || followedUser.id] ? (
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
