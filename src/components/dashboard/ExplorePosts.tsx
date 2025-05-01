import { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { PortfolioItem, User } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PortfolioItemCard } from '@/components/portfolio/PortfolioItemCard';
import { Lightbox } from '@/components/ui/Lightbox';
import { Users2, Star, TrendingUp, Crown, Trophy } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ExplorePosts = () => {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<{
    feed: PortfolioItem[];
    trending: PortfolioItem[];
    featured: PortfolioItem[];
  }>({
    feed: [],
    trending: [],
    featured: []
  });
  const [filter, setFilter] = useState<'feed' | 'trending'>('feed');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, User>>({});

  const fetchPosts = async () => {
    if (!user) {
      return null;
    }

    try {
      setLoading(true);

      // Get following list and their posts
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      const following = userDoc.data()?.following || [];

      // Fetch current user's and followed users' documents
      const userDocs = await Promise.all(
        [...following, user.id].map(uid => getDoc(doc(db, 'users', uid)))
      );

      // Extract gdrive_portfolio_items from user documents
      const allPosts = userDocs.flatMap(doc => {
        const userData = doc.data();
        return (userData?.gdrive_portfolio_items || []).map((item: any) => ({
          ...item,
          userId: doc.id
        }));
      });

      // Filter and sort posts
      const publishedPosts = allPosts.filter(item => item.status === 'published');

      const newPosts = {
        feed: publishedPosts
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 10),
        trending: publishedPosts
          .sort((a, b) => (b.likes || 0) - (a.likes || 0))
          .slice(0, 10),
        featured: publishedPosts
          .filter(item => item.is_featured)
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
          .slice(0, 10)
      };
      setPosts(newPosts);

      // Cache user data
      const userIds = new Set([
        ...newPosts.feed.map(p => p.userId),
        ...newPosts.trending.map(p => p.userId),
        ...newPosts.featured.map(p => p.userId)
      ]);

      const userPromises = Array.from(userIds).map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return { id: uid, ...userDoc.data() } as User;
      });

      const users = await Promise.all(userPromises);
      const newUserCache = users.reduce((acc, user) => {
        if (user) acc[user.id] = user;
        return acc;
      }, {} as Record<string, User>);

      setUserCache(newUserCache);

    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filter, user]);

  const handleLightbox = (item: PortfolioItem | null) => {
    setSelectedItem(item);
    setIsLightboxOpen(!!item);
    if (item) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  const getUserForPost = (userId: string): User | undefined => {
    return userCache[userId];
  };

  const LeaderboardPreview = () => {
    return (
      <Card className="bg-sortmy-gray/10 border-sortmy-blue/20 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-sortmy-darker/30 backdrop-blur-[2px] z-0" />
        <CardContent className="relative z-10 p-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="space-y-4">
              <Trophy className="w-12 h-12 text-sortmy-blue/80 animate-pulse" />
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Post Leaderboard</h3>
                <p className="text-sm text-gray-400">
                  Discover the most popular posts in the community!
                </p>
              </div>
            </div>
            <div className="w-full space-y-4">
              <div className="space-y-3">
                {[1, 2, 3].map((rank) => (
                  <div key={rank} className="flex items-center gap-3 p-3 rounded-lg bg-sortmy-darker/50 border border-sortmy-gray/10">
                    <div className="w-8 h-8 rounded-full bg-sortmy-blue/10 flex items-center justify-center text-sortmy-blue font-semibold">
                      {rank}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-sortmy-gray/20" />
                    <div className="flex-1">
                      <div className="h-3 w-24 bg-sortmy-gray/20 rounded" />
                      <div className="h-2 w-16 bg-sortmy-gray/20 rounded mt-2" />
                    </div>
                    <div className="h-6 w-16 bg-sortmy-blue/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-3 rounded-lg bg-sortmy-darker/50 border border-sortmy-gray/10 text-center">
                <p className="text-xs text-gray-400">Total Posts</p>
                <div className="h-3 w-12 bg-sortmy-gray/20 rounded mx-auto mt-2" />
              </div>
              <div className="p-3 rounded-lg bg-sortmy-darker/50 border border-sortmy-gray/10 text-center">
                <p className="text-xs text-gray-400">Total Likes</p>
                <div className="h-3 w-12 bg-sortmy-gray/20 rounded mx-auto mt-2" />
              </div>
            </div>
            <div>
              <Badge variant="outline" className="bg-sortmy-blue/10 text-sortmy-blue">
                Coming Soon
              </Badge>
            </div>
            <div className="w-full space-y-2 text-left">
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <Star className="w-4 h-4 text-sortmy-blue" />
                Daily & Weekly Rankings
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <Crown className="w-4 h-4 text-sortmy-blue" />
                Monthly Competitions
              </p>
              <p className="text-xs text-gray-400 flex items-center gap=2">
                <Users2 className="w-4 h-4 text-sortmy-blue" />
                Community Favorites
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPosts = () => {
    return (
      <div className="flex gap-6 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="flex-1">
          <div className="max-w-[470px] mx-auto mb-6">
            <GlassCard>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4" />
                <h2 className="font-semibold">Featured</h2>
              </div>
              <div className="space-y-6">
                {loading ? (
                  Array(2).fill(null).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))
                ) : posts.featured.map((item: PortfolioItem) => (
                  <div
                    key={item.id}
                    onClick={() => handleLightbox(item)}
                    className="cursor-pointer transform hover:scale-[1.02] transition-transform bg-sortmy-darker/70 rounded-lg overflow-hidden"
                  >
                    <PortfolioItemCard
                      item={item}
                      showUsername={true}
                      username={getUserForPost(item.userId)?.username || 'Unknown Creator'}
                    />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="mb-6">
              <Tabs value={filter} onValueChange={(value) => setFilter(value as 'feed' | 'trending')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="feed" className="flex items-center gap-2">
                    <Users2 className="w-4 h-4" />
                    Following
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </GlassCard>

            <div className="max-w-[470px] mx-auto space-y-6">
              {loading ? (
                <div className="space-y-6">
                  {Array(6).fill(null).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : posts[filter].length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-400">No posts found</p>
                  {filter === 'feed' && (
                    <p className="text-sm text-gray-500 mt-2">
                      Follow some creators to see their posts here
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {posts[filter].map((item: PortfolioItem) => (
                    <div
                      key={item.id}
                      onClick={() => handleLightbox(item)}
                      className="cursor-pointer transform hover:scale-[1.02] transition-transform bg-sortmy-darker/70 rounded-lg overflow-hidden"
                    >
                      <PortfolioItemCard
                        item={item}
                        showUsername={true}
                        username={getUserForPost(item.userId)?.username || 'Unknown Creator'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedItem && (
            <Lightbox
              isOpen={isLightboxOpen}
              onClose={() => handleLightbox(null)}
              item={selectedItem}
            />
          )}
        </div>
        <div className="hidden xl:block w-80">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-sortmy-blue/20 scrollbar-track-sortmy-darker">
            <LeaderboardPreview />
          </div>
        </div>
      </div>
    );
  };

  return renderPosts();
};

export default ExplorePosts;
