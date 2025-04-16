import { useState } from 'react';
import { Users, Settings, Edit, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, PortfolioItem } from '@/types';
import ProfileEditForm from './profile/ProfileEditForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import MessageButton from '@/components/messaging/MessageButton';

interface CreatorProfileHeaderProps {
  user: User | null;
  portfolio: PortfolioItem[];
  isCurrentUser?: boolean;
  onEditClick?: () => void;
}

const CreatorProfileHeader = ({ user, portfolio, isCurrentUser = false, onEditClick }: CreatorProfileHeaderProps) => {

  if (!user) return null;

  const getInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  };

  const postCount = portfolio?.length || 0;
  const totalLikes = portfolio?.reduce((acc, item) => acc + (item.likes || 0), 0) || 0;

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
              {isCurrentUser ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => onEditClick && onEditClick()}
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <MessageButton
                    userId={user.uid}
                    username={user.username || ''}
                    variant="outline"
                    size="sm"
                  />
                  <Button size="sm" className="gap-2 bg-sortmy-blue hover:bg-sortmy-blue/90">
                    <Users className="w-4 h-4" />
                    Follow
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
            <div className="text-center">
              <div className="font-bold">{user.followers_count || 0}</div>
              <div className="text-xs text-gray-400">followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{user.following_count || 0}</div>
              <div className="text-xs text-gray-400">following</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{totalLikes}</div>
              <div className="text-xs text-gray-400">likes</div>
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
      </div>
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


