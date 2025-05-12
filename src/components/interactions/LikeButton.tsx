import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { trackInteraction } from '@/services/analyticsService';

interface LikeButtonProps {
  initialLiked: boolean;
  initialLikeCount: number;
  postId: string;
  user: { id: string; uid?: string; username?: string; xp?: number; level?: number; streak_days?: number; email?: string; badges?: string[]; following?: string[]; followers_count?: number; following_count?: number } | null;
  likePost: (postId: string, userId: string, liked: boolean, postType?: string) => Promise<void>;
  postType?: string; // 'portfolio' | 'video' | etc.
  onLikeChange?: (liked: boolean, newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  initialLiked,
  initialLikeCount,
  postId,
  user,
  likePost,
  postType = 'portfolio',
  onLikeChange,
  size = 'md',
  showCount = true,
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  const handleLikeClick = async () => {
    if (!user) return;
    const userId = user.uid || user.id;
    if (!userId) return;

    setLoading(true);
    setError(null);
    const prevLiked = liked;
    const prevCount = likeCount;

    // Optimistic update
    setLiked(!liked);
    setLikeCount(prev => prev + (liked ? -1 : 1));
    onLikeChange?.(!liked, likeCount + (liked ? -1 : 1));

    try {
      await likePost(postId, userId, !liked, postType);

      // Track like interaction in analytics
      if (!liked) {  // Only track when adding a like, not removing
        await trackInteraction(
          postId,
          postType === 'portfolio' ? 'portfolio' : 'profile',
          'like',
          {
            ...user,
            uid: userId,
            username: user.username || '',
            xp: user.xp || 0,
            level: user.level || 1,
            streak_days: user.streak_days || 0,
            email: user.email || '',
            last_login: new Date().toISOString(),
            badges: [],  // Required by User type
            following: [],  // Required by User type
            followers_count: 0,  // Required by User type
            following_count: 0   // Required by User type
          }
        );
      }
    } catch (error: any) {
      // Rollback on error
      setLiked(prevLiked);
      setLikeCount(prevCount);
      onLikeChange?.(prevLiked, prevCount);
      setError(error?.message || 'Error toggling like');
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleLikeClick}
        disabled={loading}
        style={{
          cursor: loading ? 'not-allowed' : 'pointer',
          background: 'none',
          border: 'none',
          outline: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontWeight: 500,
          fontSize: size === 'sm' ? 14 : size === 'lg' ? 20 : 16,
          color: liked ? '#ef4444' : '#94a3b8',
          transition: 'color 0.2s',
        }}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <Heart
          fill={liked ? '#ef4444' : 'none'}
          stroke={liked ? '#ef4444' : '#94a3b8'}
          width={size === 'sm' ? 18 : size === 'lg' ? 28 : 22}
          height={size === 'sm' ? 18 : size === 'lg' ? 28 : 22}
          style={{ marginRight: 6, transition: 'fill 0.2s, stroke 0.2s' }}
        />
        {showCount && <span>{likeCount}</span>}
      </button>
      {error && (
        <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
          {error}
        </div>
      )}
    </>
  );
};

export default LikeButton;