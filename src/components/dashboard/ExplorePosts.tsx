import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { PortfolioItem, User } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PortfolioItemCard } from '@/components/portfolio/PortfolioItemCard';
import { Lightbox } from '@/components/ui/Lightbox';
import { useBackground } from '@/contexts/BackgroundContext';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import AuroraBackground from '@/components/ui/AuroraBackground';


import { Separator } from '@/components/ui/separator';

const ExplorePosts = () => {
  const { user: currentUser } = useAuth();
  const { backgroundType, cycleBackgroundType } = useBackground();
  const [loading, setLoading] = useState(true);
  const [sortMyAIPosts, setSortMyAIPosts] = useState<PortfolioItem[]>([]);
  const [communityPosts, setCommunityPosts] = useState<PortfolioItem[]>([]);
  const [filter, setFilter] = useState<'latest' | 'popular' | 'trending'>('latest');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const location = useLocation();

  // Check if we're in the dashboard layout
  const isInDashboard = location.pathname.includes('/dashboard');

  // Fetch posts on component mount
  useEffect(() => {
    fetchPosts();
  }, [filter]);

  // Handle lightbox open/close
  const openLightbox = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsLightboxOpen(true);
    document.body.classList.add('overflow-hidden');
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.classList.remove('overflow-hidden');
  };

  // Fetch posts from Firebase
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch SortMyAI's posts (assuming SortMyAI has a specific user ID)
      const sortMyAIUserId = 'sortmyai'; // Replace with actual SortMyAI user ID
      await fetchSortMyAIPosts(sortMyAIUserId);

      // Fetch community posts based on filter
      await fetchCommunityPosts();
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch SortMyAI's posts
  const fetchSortMyAIPosts = async (sortMyAIUserId: string) => {
    try {
      // First check if SortMyAI user exists
      const userRef = doc(db, 'users', sortMyAIUserId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUserCache(prev => ({ ...prev, [sortMyAIUserId]: userData }));

        // Get SortMyAI's portfolio items
        if (userData.gdrive_portfolio_items) {
          const items = userData.gdrive_portfolio_items
            .filter((item: any) => item.status === 'published')
            .map((item: any) => ({
              ...item,
              user_id: sortMyAIUserId
            }));

          setSortMyAIPosts(items);
        }
      } else {
        // If SortMyAI user doesn't exist, try to fetch from a collection
        const postsRef = collection(db, 'featured_posts');
        const postsSnapshot = await getDocs(postsRef);

        if (!postsSnapshot.empty) {
          const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            user_id: 'sortmyai'
          })) as PortfolioItem[];

          setSortMyAIPosts(posts);
        }
      }
    } catch (error) {
      console.error('Error fetching SortMyAI posts:', error);
    }
  };

  // Fetch community posts
  const fetchCommunityPosts = async () => {
    try {
      // Create a set to store unique user IDs
      const userIds = new Set<string>();
      const posts: PortfolioItem[] = [];

      // Query all users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      // Process each user's portfolio items
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as User;
        const userId = userDoc.id;

        // Skip SortMyAI user
        if (userId === 'sortmyai') continue;

        // Cache user data
        setUserCache(prev => ({ ...prev, [userId]: userData }));

        // Get user's portfolio items
        if (userData.gdrive_portfolio_items) {
          const items = userData.gdrive_portfolio_items
            .filter((item: any) => item.status === 'published')
            .map((item: any) => ({
              ...item,
              user_id: userId
            }));

          posts.push(...items);
          userIds.add(userId);
        }
      }

      // Sort posts based on filter
      let sortedPosts: PortfolioItem[] = [];

      switch (filter) {
        case 'latest':
          sortedPosts = posts.sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB - dateA;
          });
          break;

        case 'popular':
          // Sort by likes count (if available)
          sortedPosts = posts.sort((a, b) => {
            const likesA = a.likes_count || 0;
            const likesB = b.likes_count || 0;
            return likesB - likesA;
          });
          break;

        case 'trending':
          // Sort by recent engagement (combination of recent likes and views)
          sortedPosts = posts.sort((a, b) => {
            const engagementA = (a.likes_count || 0) + (a.views_count || 0);
            const engagementB = (b.likes_count || 0) + (b.views_count || 0);
            return engagementB - engagementA;
          });
          break;

        default:
          sortedPosts = posts;
      }

      setCommunityPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching community posts:', error);
    }
  };

  // Get user data for a post
  const getUserForPost = (userId: string): User | undefined => {
    return userCache[userId];
  };

  return (
    <div className="relative min-h-screen bg-sortmy-dark text-white">
      {/* Background */}
      {backgroundType === 'aurora' ? (
        <AuroraBackground intensity={50} className="z-0" />
      ) : (
        <div className="fixed inset-0 bg-sortmy-dark z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d001a] to-[#0a0a2e] opacity-80"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>
      )}

      {/* Background toggle button at bottom right - only show when not in dashboard */}
      {!isInDashboard && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-sortmy-darker/70 border-sortmy-blue/20"
            onClick={cycleBackgroundType}
            title="Toggle Background Style"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Explore Posts</h1>
            <p className="text-gray-400">Discover amazing AI-generated content from the community</p>
          </div>

          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* SortMyAI Featured Posts */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Featured Posts</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full" />
              ))}
            </div>
          ) : sortMyAIPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortMyAIPosts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(item)}
                  className="cursor-pointer"
                >
                  <PortfolioItemCard
                    item={item}
                    showUsername={true}
                    username={getUserForPost(item.user_id)?.username || 'SortMyAI'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-sortmy-gray/10 rounded-lg">
              <p className="text-gray-400">No featured posts available</p>
            </div>
          )}
        </div>

        <Separator className="my-8 bg-sortmy-blue/20" />

        {/* Community Posts */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Community Posts</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[300px] w-full" />
              ))}
            </div>
          ) : communityPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityPosts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openLightbox(item)}
                  className="cursor-pointer"
                >
                  <PortfolioItemCard
                    item={item}
                    showUsername={true}
                    username={getUserForPost(item.user_id)?.username || 'Unknown Creator'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-sortmy-gray/10 rounded-lg">
              <p className="text-gray-400">No community posts available</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox for post details */}
      <Lightbox
        item={selectedItem}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
        creatorUsername={selectedItem ? getUserForPost(selectedItem.user_id)?.username : undefined}
      />
    </div>
  );
};

export default ExplorePosts;
