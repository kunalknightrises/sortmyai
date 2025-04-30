import { useState, useEffect } from 'react';
import { collection, getDocs, getDoc, doc, query, where, orderBy, limit, QuerySnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { PortfolioItem, User } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PortfolioItemCard } from '@/components/portfolio/PortfolioItemCard';
import { Lightbox } from '@/components/ui/Lightbox';
import { Users2, Star, TrendingUp } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { useToast } from '@/hooks/use-toast';

const ExplorePosts = () => {
  const { user } = useAuth();
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
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get following list for feed
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      const following = userDoc.data()?.following || [];
      
      // For debug: First get all posts to see what's in the collection
      const allPostsQuery = query(
        collection(db, 'portfolio'),
        limit(10)
      );
      const allPosts = await getDocs(allPostsQuery);
      console.log('All posts (first 10):', allPosts.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Feed query - Get posts from followed users and own posts
      const feedQuery = query(
        collection(db, 'portfolio'),
        where('userId', 'in', [...following, user.id].slice(0, 10)), // Firestore limits 'in' to 10 values
        where('status', '==', 'published'),
        orderBy('created_at', 'desc'),
        limit(10)
      );
      
      // Trending query - Most liked posts
      const trendingQuery = query(
        collection(db, 'portfolio'),
        where('status', '==', 'published'),
        orderBy('likes', 'desc'),
        limit(10)
      );
      
      // Featured query - All posts for now (we'll add featured flag later)
      const featuredQuery = query(
        collection(db, 'portfolio'),
        where('status', '==', 'published'),
        orderBy('created_at', 'desc'),
        limit(10)
      );

      console.log('Following list:', following);
      console.log('Current user ID:', user.id);
      console.log('Feed query:', feedQuery);
      
      // Execute all queries in parallel
      const [feedSnap, trendingSnap, featuredSnap] = await Promise.all([
        getDocs(feedQuery),
        getDocs(trendingQuery),
        getDocs(featuredQuery)
      ]);

      // Log raw snapshots
      console.log('Feed snapshot size:', feedSnap.size);
      console.log('Trending snapshot size:', trendingSnap.size);
      console.log('Featured snapshot size:', featuredSnap.size);

      // Transform query snapshots to PortfolioItems
      const transformDocs = (snapshot: QuerySnapshot) => {
        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Raw doc data:', data);
          return {
            ...data,
            id: doc.id,
          } as PortfolioItem;
        });
        console.log('Transformed items:', items);
        return items;
      };

      const newPosts = {
        feed: transformDocs(feedSnap),
        trending: transformDocs(trendingSnap),
        featured: transformDocs(featuredSnap)
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

  return (
    <>
      {/* Featured Section - Horizontal Scroll */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4" />
          <h2 className="font-semibold">Featured</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {loading ? (
            Array(4).fill(null).map((_, i) => (
              <div key={i} className="min-w-[300px]">
                <Skeleton className="aspect-[4/3] rounded-lg" />
              </div>
            ))
          ) : posts.featured.map((item: PortfolioItem) => (
            <div
              key={item.id}
              onClick={() => handleLightbox(item)}
              className="min-w-[300px] cursor-pointer transform hover:scale-[1.02] transition-transform"
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

      {/* Tabs for Following and Trending */}
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

      {/* Vertical Grid for Following/Trending */}
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
            {posts[filter].map((item: PortfolioItem) => (
              <div
                key={item.id}
                onClick={() => handleLightbox(item)}
                className="cursor-pointer transform hover:scale-[1.02] transition-transform"
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

      {/* Lightbox */}
      {selectedItem && (
        <Lightbox
          item={selectedItem}
          isOpen={isLightboxOpen}
          onClose={() => handleLightbox(null)}
        />
      )}
    </>
  );
};

export default ExplorePosts;
