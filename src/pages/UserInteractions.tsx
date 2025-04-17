import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageSquare, Loader2, ExternalLink } from 'lucide-react';
import { getUserLikedPosts, getUserComments } from '@/services/interactionService';
import { Comment } from '@/types/interactions';
import { PortfolioItem } from '@/types';
import { getPortfolioItemById } from '@/services/portfolioService';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '@/components/ui/GlassCard';
// import { Separator } from '@/components/ui/separator';

const UserInteractions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'likes' | 'comments'>('likes');
  const [likedPosts, setLikedPosts] = useState<PortfolioItem[]>([]);
  const [userComments, setUserComments] = useState<(Comment & { post?: PortfolioItem | undefined })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchInteractions = async () => {
      setLoading(true);
      try {
        if (activeTab === 'likes') {
          // Fetch liked posts
          const likedPostIds = await getUserLikedPosts(user.uid);

          // Get details for each post
          const postsData = await Promise.all(
            likedPostIds.map(async (postId) => {
              try {
                const post = await getPortfolioItemById(postId);
                // If post doesn't have author info, add placeholder data
                if (post && !post.authorName) {
                  return {
                    ...post,
                    authorName: 'Unknown User',
                    authorAvatar: '',
                    authorId: post.userId || ''
                  };
                }
                return post;
              } catch (error) {
                console.error(`Error fetching post ${postId}:`, error);
                return null;
              }
            })
          );

          setLikedPosts(postsData.filter(Boolean) as PortfolioItem[]);
        } else {
          // Fetch user comments
          const comments = await getUserComments(user.uid);

          // Get post details for each comment
          const commentsWithPosts = await Promise.all(
            comments.map(async (comment) => {
              try {
                const post = await getPortfolioItemById(comment.postId);
                if (post) {
                  // Ensure post has author properties
                  if (!post.authorName) {
                    post.authorName = 'Unknown User';
                    post.authorAvatar = '';
                    post.authorId = post.userId || '';
                  }
                  return { ...comment, post };
                }
                return { ...comment, post: undefined };
              } catch (error) {
                console.error(`Error fetching post for comment ${comment.id}:`, error);
                return { ...comment, post: undefined };
              }
            })
          );

          setUserComments(commentsWithPosts as (Comment & { post?: PortfolioItem | undefined })[]);
        }
      } catch (error) {
        console.error('Error fetching interactions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your interactions',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [user, activeTab, navigate, toast]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const renderLikedPosts = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-sortmy-blue" />
        </div>
      );
    }

    if (likedPosts.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <Heart className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-medium mb-2">No Liked Posts Yet</h3>
          <p>When you like posts, they will appear here</p>
          <Button
            className="mt-4 bg-sortmy-blue hover:bg-sortmy-blue/90"
            onClick={() => navigate('/explore')}
          >
            Explore Creators
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedPosts.map((post) => (
          <Card key={post.id} className="bg-sortmy-dark/50 border-sortmy-blue/20 overflow-hidden">
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.media_urls[0]}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-2 line-clamp-1">{post.title}</h3>
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{post.description}</p>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue text-xs">
                      {getInitials(post.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{post.authorName}</span>
                </div>

                <Link to={`/portfolio/${post.authorId}/${post.id}`}>
                  <Button variant="ghost" size="sm" className="text-sortmy-blue">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderUserComments = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-sortmy-blue" />
        </div>
      );
    }

    if (userComments.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-medium mb-2">No Comments Yet</h3>
          <p>When you comment on posts, they will appear here</p>
          <Button
            className="mt-4 bg-sortmy-blue hover:bg-sortmy-blue/90"
            onClick={() => navigate('/explore')}
          >
            Explore Creators
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {userComments.map((comment) => (
          <GlassCard key={comment.id} className="border-sortmy-blue/20">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue text-xs">
                    {getInitials(user?.username)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{user?.username}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {comment.post && (
                      <Link to={`/portfolio/${comment.post.authorId}/${comment.post.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-sortmy-blue">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Post
                        </Button>
                      </Link>
                    )}
                  </div>

                  <p className="text-sm mt-1">{comment.content}</p>

                  {comment.post && (
                    <div className="mt-3 pt-3 border-t border-sortmy-blue/10">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={comment.post.authorAvatar} />
                          <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue text-xs">
                            {getInitials(comment.post.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-400">
                          Commented on <span className="text-sortmy-blue">{comment.post.authorName}'s</span> post:
                        </span>
                      </div>
                      <p className="text-sm font-medium mt-1">{comment.post.title}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-2xl font-bold mb-6">Your Interactions</h1>

      <Tabs
        defaultValue="likes"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'likes' | 'comments')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-sortmy-darker">
          <TabsTrigger
            value="likes"
            className="data-[state=active]:bg-sortmy-blue/20"
          >
            <Heart className="h-4 w-4 mr-2" />
            Likes
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="data-[state=active]:bg-sortmy-blue/20"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="likes" className="mt-0">
          {renderLikedPosts()}
        </TabsContent>

        <TabsContent value="comments" className="mt-0">
          {renderUserComments()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserInteractions;
