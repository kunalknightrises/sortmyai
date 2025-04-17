import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  getPostCommentsWithReplies,
  addComment,
  updateComment,
  deleteComment
} from '@/services/interactionService';
import { CommentWithUser } from '@/types/interactions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Send,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CommentSectionProps {
  postId: string;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
  className?: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  initialCommentCount = 0,
  onCommentCountChange,
  className
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const commentsData = await getPostCommentsWithReplies(postId);
        setComments(commentsData);
        // Update comment count
        const totalCount = commentsData.reduce(
          (count, comment) => count + 1 + (comment.replies?.length || 0),
          0
        );
        setCommentCount(totalCount);
        onCommentCountChange?.(totalCount);
      } catch (error) {
        console.error('Error loading comments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load comments',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [postId, onCommentCountChange, toast]);

  // Focus on comment input when replying
  useEffect(() => {
    if (replyTo && commentInputRef.current) {
      commentInputRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to comment',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // Add the comment
      const commentId = await addComment(
        user.uid,
        postId,
        newComment.trim(),
        replyTo?.id
      );

      // Comment was added successfully, even if there was an error updating the count
      if (commentId) {
        // Reset form immediately to give user feedback
        setNewComment('');
        setReplyTo(null);

        toast({
          title: 'Comment added',
          description: 'Your comment has been added successfully',
          variant: 'success'
        });

        try {
          // Refresh comments
          const commentsData = await getPostCommentsWithReplies(postId);
          setComments(commentsData);

          // Update comment count
          const totalCount = commentsData.reduce(
            (count, comment) => count + 1 + (comment.replies?.length || 0),
            0
          );
          setCommentCount(totalCount);
          onCommentCountChange?.(totalCount);
        } catch (refreshError) {
          console.warn('Error refreshing comments, but comment was added:', refreshError);
          // Increment the comment count locally since we know a comment was added
          const newCount = commentCount + 1;
          setCommentCount(newCount);
          onCommentCountChange?.(newCount);
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!user || !editText.trim()) return;

    setSubmitting(true);
    try {
      await updateComment(commentId, user.uid, editText.trim());

      // Refresh comments
      const commentsData = await getPostCommentsWithReplies(postId);
      setComments(commentsData);

      // Reset form
      setEditingComment(null);
      setEditText('');

      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update comment',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setSubmitting(true);
    try {
      await deleteComment(commentId, user.uid);

      // Refresh comments
      const commentsData = await getPostCommentsWithReplies(postId);
      setComments(commentsData);

      // Update comment count
      const totalCount = commentsData.reduce(
        (count, comment) => count + 1 + (comment.replies?.length || 0),
        0
      );
      setCommentCount(totalCount);
      onCommentCountChange?.(totalCount);

      toast({
        title: 'Comment deleted',
        description: 'Your comment has been deleted successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (comment: CommentWithUser) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditText('');
  };

  const startReplying = (comment: CommentWithUser) => {
    setReplyTo({
      id: comment.id,
      username: comment.user.username || 'Unknown User'
    });
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const cancelReplying = () => {
    setReplyTo(null);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const renderComment = (comment: CommentWithUser, isReply = false) => {
    const isEditing = editingComment === comment.id;
    const isCurrentUser = user?.uid === comment.userId;
    const formattedTime = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

    return (
      <div
        key={comment.id}
        className={cn(
          "flex gap-3 mb-4",
          isReply && "ml-12 mt-3"
        )}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.userAvatar} />
          <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue text-xs">
            {getInitials(comment.username)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-sortmy-dark/50 border border-sortmy-blue/10 rounded-lg p-3">
            <div className="flex justify-between items-start mb-1">
              <div className="font-medium text-sm">{comment.username || 'Unknown User'}</div>

              {isCurrentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-sortmy-darker border-sortmy-blue/20">
                    <DropdownMenuItem
                      className="flex items-center cursor-pointer"
                      onClick={() => startEditing(comment)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center text-red-500 cursor-pointer"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div>
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[80px] bg-sortmy-dark/70 border-sortmy-blue/20 mb-2"
                  placeholder="Edit your comment..."
                  disabled={submitting}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelEditing}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={submitting || !editText.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    Update
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-200">{comment.content}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">{formattedTime}</span>

                  {!isReply && user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-gray-400 hover:text-sortmy-blue"
                      onClick={() => startReplying(comment)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Render replies */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("mt-6", className)}>
      <div className="flex items-center mb-4">
        <MessageSquare className="h-5 w-5 mr-2 text-sortmy-blue" />
        <h3 className="text-lg font-medium">Comments ({commentCount})</h3>
      </div>

      <Separator className="mb-4 bg-sortmy-blue/20" />

      {/* Comment input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue text-xs">
              {user ? getInitials(user.username) : 'G'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            {replyTo && (
              <div className="mb-2 text-sm text-sortmy-blue flex items-center">
                <Reply className="h-3 w-3 mr-1" />
                Replying to {replyTo.username}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-2 text-gray-400"
                  onClick={cancelReplying}
                >
                  ×
                </Button>
              </div>
            )}

            <Textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] bg-sortmy-dark/70 border-sortmy-blue/20"
              placeholder={user ? "Add a comment..." : "Sign in to comment"}
              disabled={!user || submitting}
            />

            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSubmitComment}
                disabled={!user || submitting || !newComment.trim()}
                className="bg-sortmy-blue hover:bg-sortmy-blue/90"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {replyTo ? 'Reply' : 'Comment'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-sortmy-blue" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div>
          {comments.map(comment => renderComment(comment))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
