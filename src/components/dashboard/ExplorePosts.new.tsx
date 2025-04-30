import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, getDoc, doc, query, where, orderBy, limit, QuerySnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { PortfolioItem, User } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PortfolioItemCard } from '@/components/portfolio/PortfolioItemCard';
import { Lightbox } from '@/components/ui/Lightbox';
import { useBackground } from '@/contexts/BackgroundContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Users2, Star, ImageIcon, TrendingUp } from 'lucide-react';
import AuroraBackground from '@/components/ui/AuroraBackground';
import GlassCard from '@/components/ui/GlassCard';
import { useToast } from '@/hooks/use-toast';

const ExplorePosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { backgroundType, cycleBackgroundType } = useBackground();
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
  const [filter, setFilter] = useState<'feed' | 'trending' | 'featured'>('feed');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const location = useLocation();
  const isInDashboard = location.pathname.includes('/dashboard');

  const fetchPosts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch feed posts (following + recommended)
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      const following = userDoc.data()?.following || [];
        const feedQuery = query(
        collection(db, 'portfolio'),
        where('status', '==', 'published'),
        where('userId', 'in', [...following, user.id].slice(0, 10)),
        orderBy('created_at', 'desc'),
        limit(10)
      );
      
      // Fetch trending posts
      const trendingQuery = query(
        collection(db, 'portfolio'),
        where('status', '==', 'published'),
        orderBy('likes_count', 'desc'),
        limit(10)
      );
      
      // Fetch featured posts
      const featuredQuery = query(
        collection(db, 'portfolio'),
        where('status', '==', 'published'),
        where('is_featured', '==', true),
        orderBy('created_at', 'desc'),
        limit(10)
      );

      const [feedSnap, trendingSnap, featuredSnap] = await Promise.all([
        getDocs(feedQuery),
        getDocs(trendingQuery),
        getDocs(featuredQuery)
      ]);      const transformDocs = (snapshot: QuerySnapshot) => 
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }) as PortfolioItem);

      setPosts({
        feed: transformDocs(feedSnap),
        trending: transformDocs(trendingSnap),
        featured: transformDocs(featuredSnap)
      });      // Cache user data
      const userIds = new Set([
        ...transformDocs(feedSnap).map((p: PortfolioItem) => p.userId),
        ...transformDocs(trendingSnap).map((p: PortfolioItem) => p.userId),
        ...transformDocs(featuredSnap).map((p: PortfolioItem) => p.userId)
      ]);

      const userPromises = Array.from(userIds).map(async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return { id: uid, ...userDoc.data() } as User;
      });

      const users = await Promise.all(userPromises);
      const newUserCache = users.reduce((acc, user) => {
        acc[user.id] = user;
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
  }, [user]);

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

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {backgroundType === 'aurora' ? (
          <AuroraBackground intensity={50} className="z-0" />
        ) : (
          <div className="absolute inset-0 bg-sortmy-dark">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d001a] to-[#0a0a2e] opacity-80" />
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ImageIcon className="w-8 h-8 mr-2 text-sortmy-blue" />
              Explore Posts
            </h1>
            <p className="text-gray-400 mt-1">
              Discover amazing AI creations from the community
            </p>
          </div>

          {!isInDashboard && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-sortmy-darker/70 border-sortmy-blue/20"
              onClick={cycleBackgroundType}
              title="Toggle Background Style"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <GlassCard className="mb-6">
          <Tabs value={filter} onValueChange={setFilter as any}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="feed" className="flex items-center gap-2">
                <Users2 className="w-4 h-4" />
                Following
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Featured
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </GlassCard>

        {/* Posts Grid */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(6).fill(null).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts[filter].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleLightbox(item)}
                  className="cursor-pointer transform hover:scale-[1.02] transition-transform"
                >                  <PortfolioItemCard
                    item={item}
                    showUsername={true}
                    username={getUserForPost(item.userId)?.username || 'Unknown Creator'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>      {/* Lightbox */}
      {selectedItem && (
        <Lightbox
          isOpen={isLightboxOpen}
          onClose={() => handleLightbox(null)}
          item={selectedItem}
        />
      )}
    </div>
  );
};

export default ExplorePosts;
