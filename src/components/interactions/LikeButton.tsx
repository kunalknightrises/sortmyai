import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  initialLiked: boolean;
  initialLikeCount: number;
  postId: string;
  user: { id: string } | null;
  likePost: (postId: string, userId: string, liked: boolean, postType?: string) => Promise<void>;
  postType?: string; // 'portfolio' | 'video' | etc.
  onLikeChange?: (liked: boolean, newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
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
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLikeClick = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const prevLiked = liked;
    const prevCount = likeCount;
    // Prevent double-like
    if (liked && prevLiked) {
      setLoading(false);
      return;
    }
    setLiked(!liked);
    setLikeCount(likeCount + (liked ? -1 : 1));
    onLikeChange?.(!liked, likeCount + (liked ? -1 : 1));
    try {
      await likePost(postId, user.id, !liked, postType);
    } catch (error: any) {
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
        <span>{likeCount}</span>
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