import { useState, useEffect } from 'react';
import { Users, Settings, Edit, ExternalLink, UserCheck, Loader2, Share2, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, PortfolioItem } from '@/types';
import ProfileEditForm from './profile/ProfileEditForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import MessageButton from '@/components/messaging/MessageButton';
import { followCreator, unfollowCreator, checkIfFollowing } from '@/services/followService';
import { useToast } from '@/hooks/use-toast';
import FollowersModal from './profile/FollowersModal';

interface CreatorProfileHeaderProps {
  user: User | null;
  portfolio: PortfolioItem[];
  isCurrentUser?: boolean;
  onEditClick?: () => void;
  onAddProject?: () => void;
}

const CreatorProfileHeader = ({ user, portfolio, isCurrentUser = false, onEditClick, onAddProject }: CreatorProfileHeaderProps) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(user?.followers_count || 0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  if (!user) return null;

  // Check if the current user is following this creator
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || isCurrentUser) return;

      try {
        const following = await checkIfFollowing(currentUser.uid, user.uid);
        setIsFollowing(following);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [currentUser, user.uid, isCurrentUser]);

  const getInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  };

  const handleFollowClick = async () => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow the creator
        await unfollowCreator(currentUser.uid, user.uid);
        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast({
          title: "Unfollowed " + user.username,
          description: "You are no longer following this creator",
          variant: "default"
        });
      } else {
        // Follow the creator
        await followCreator(currentUser.uid, user.uid);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast({
          title: "Following " + user.username,
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

  const postCount = portfolio?.length || 0;

  return (
    <div className="py-8 border-b border-sortmy-gray/30">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Profile Info */}
        <div className="flex-1 space-y-4 text-center md:text-left order-2 md:order-1">

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
              {isCurrentUser ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => onEditClick && onEditClick()}
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const url = window.location.href;
                      const title = `${user.username}'s SortMyAI Profile`;
                      const text = `Check out ${user.username}'s AI portfolio on SortMyAI!`;

                      // Use Web Share API if available
                      if (navigator.share) {
                        navigator.share({
                          title,
                          text,
                          url
                        }).catch(err => {
                          console.error('Error sharing:', err);
                          // Fallback to clipboard
                          navigator.clipboard.writeText(url);
                          alert('Profile link copied to clipboard!');
                        });
                      } else {
                        // Fallback for browsers that don't support Web Share API
                        navigator.clipboard.writeText(url);
                        alert('Profile link copied to clipboard!');
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Share Profile
                  </Button>
                  {onAddProject && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={onAddProject}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add Project
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <MessageButton
                    userId={user.uid}
                    username={user.username || ''}
                    variant="outline"
                    size="sm"
                  />
                  <Button
                    size="sm"
                    className={`gap-2 ${isFollowing ? 'bg-sortmy-dark border border-sortmy-blue/50' : 'bg-sortmy-blue hover:bg-sortmy-blue/90'}`}
                    onClick={handleFollowClick}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                      <UserCheck className="w-4 h-4" />
                    ) : (
                      <Users className="w-4 h-4" />
                    )}
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </>
              )}
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
            <div
              className="text-center cursor-pointer hover:text-sortmy-blue transition-colors"
              onClick={() => {
                setActiveTab('followers');
                setShowFollowersModal(true);
              }}
            >
              <div className="font-bold">{followerCount}</div>
              <div className="text-xs text-gray-400">followers</div>
            </div>
            <div
              className="text-center cursor-pointer hover:text-sortmy-blue transition-colors"
              onClick={() => {
                setActiveTab('following');
                setShowFollowersModal(true);
              }}
            >
              <div className="font-bold">{user.following_count || 0}</div>
              <div className="text-xs text-gray-400">following</div>
            </div>

          </div>

          {/* Bio */}
          <div>
            <h2 className="font-medium">{user.profession || 'AI Content Creator'}</h2>
            <p className="text-sm text-gray-300 mt-1">{user.bio || 'Creating the future with AI. Specializing in digital avatars, AI art, voice cloning, and prompt engineering.'}</p>
            {user.website && (
              <a
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sortmy-blue mt-1 flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <a href={`/portfolio/${user.username}`} className="text-sm text-sortmy-blue mt-1 hover:underline cursor-pointer">
              sortmy.ai/{user.username}
            </a>
          </div>
        </div>

        {/* Avatar - Moved to right side */}
        <div className="order-1 md:order-2">
          <Avatar className="h-24 w-24 md:h-36 md:w-36 border-2 border-sortmy-blue/20">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className="text-xl bg-sortmy-blue/20 text-sortmy-blue">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Followers/Following Modal */}
      {user && (
        <FollowersModal
          isOpen={showFollowersModal}
          onClose={() => setShowFollowersModal(false)}
          userId={user.uid}
          username={user.username || ''}
          initialTab={activeTab}
          followerCount={followerCount}
          followingCount={user.following_count || 0}
        />
      )}
    </div>
  );
};

// Add the edit dialog to the main component
export default function CreatorProfileHeaderWithEdit(props: CreatorProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { refreshUser } = useAuth();

  const handleEditComplete = async () => {
    setIsEditDialogOpen(false);
    // Refresh user data without reloading the page
    await refreshUser();
  };

  return (
    <>
      <CreatorProfileHeader
        {...props}
        isCurrentUser={props.isCurrentUser}
      />

      {props.user && props.isCurrentUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-sortmy-dark border-sortmy-gray">
            <ProfileEditForm
              user={props.user}
              onSubmit={handleEditComplete}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}


