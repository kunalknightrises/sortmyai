import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { likePost, unlikePost, checkUserLiked } from '@/services/interactionService';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  initialLiked?: boolean;
  onLikeChange?: (liked: boolean, newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikeCount,
  initialLiked = false,
  onLikeChange,
  size = 'md',
  showCount = true,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // Check if user has liked the post
  useEffect(() => {
    const checkLiked = async () => {
      if (!user) return;
      
      try {
        const hasLiked = await checkUserLiked(user.uid, postId);
        setLiked(hasLiked);
      } catch (error) {
        console.error('Error checking if post is liked:', error);
      }
    };

    checkLiked();
  }, [user, postId]);

  const handleLikeClick = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like posts',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      if (liked) {
        // Unlike the post
        await unlikePost(user.uid, postId);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        onLikeChange?.(false, Math.max(0, likeCount - 1));
      } else {
        // Like the post
        await likePost(user.uid, postId);
        setLiked(true);
        setLikeCount(prev => prev + 1);
        onLikeChange?.(true, likeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update like',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        sizeClasses[size],
        "gap-1.5 hover:bg-transparent",
        liked ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-300",
        loading && "opacity-70 cursor-not-allowed",
        className
      )}
      onClick={handleLikeClick}
      disabled={loading}
    >
      <Heart
        className={cn(
          iconSizes[size],
          liked ? "fill-current" : "fill-none",
          "transition-all duration-300",
          liked && "scale-110"
        )}
      />
      {showCount && (
        <span className={cn(
          "font-medium",
          liked ? "text-red-500" : "text-gray-400"
        )}>
          {likeCount}
        </span>
      )}
    </Button>
  );
};

export default LikeButton;
