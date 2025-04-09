import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PortfolioItem, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, Video, Users, Filter } from 'lucide-react';
import CreatorProfileHeader from '@/components/CreatorProfileHeader';
import ContentGrid from '@/components/ContentGrid';
import ReelsView from '@/components/ReelsView';
import TaggedView from '@/components/TaggedView';

const InstagramStylePortfolio = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [filterTool, setFilterTool] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const { toast } = useToast();
  const isMobile = window.innerWidth <= 768;
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        // Simulate loading for demo
        setTimeout(async () => {
          // Fetch user
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('username', '==', username || 'demo-user'));
          const userSnapshot = await getDocs(q);
          
          let userData: User | null = null;
          
          if (!userSnapshot.empty) {
            userData = {
              id: userSnapshot.docs[0].id,
              ...userSnapshot.docs[0].data()
            } as User;
          } else {
            // Use mock user data if not found
            userData = {
              id: 'demo-id',
              uid: 'demo-uid',
              username: username || 'aicreator',
              avatar_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150&h=150&fit=crop',
              is_premium: true,
              claude_enabled: true,
              created_at: new Date().toISOString()
            };
          }
          
          setUser(userData);
          
          // Fetch portfolio items
          const portfolioRef = collection(db, 'portfolio');
          const portfolioQuery = query(portfolioRef, where('user_id', '==', userData.id));
          const portfolioSnapshot = await getDocs(portfolioQuery);
          
          const portfolioData = portfolioSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as PortfolioItem[];
          
          // Mock portfolio data
          const mockPortfolio: PortfolioItem[] = [
            {
              id: '1',
              title: 'AI Generated Avatar',
              description: 'Digital avatar created with HeyGen',
              media_url: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=600&fit=crop',
              media_type: 'video',
              tools_used: ['HeyGen', 'D-ID'],
              user_id: 'demo-id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_public: true,
              likes: 127
            },
            {
              id: '2',
              title: 'Cyberpunk City',
              description: 'Futuristic cityscape generated with Midjourney',
              media_url: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=600&h=600&fit=crop',
              media_type: 'image',
              tools_used: ['Midjourney', 'DALL-E'],
              user_id: 'demo-id',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              is_public: true,
              likes: 84
            },
            {
              id: '4',
              title: 'Neural Network Art',
              description: 'Abstract pattern generated with Stable Diffusion',
              media_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=600&fit=crop',
              media_type: 'image',
              tools_used: ['Stable Diffusion', 'Firefly'],
              user_id: 'demo-id',
              created_at: new Date(Date.now() - 259200000).toISOString(),
              updated_at: new Date(Date.now() - 259200000).toISOString(),
              is_public: true,
              likes: 93
            },
            {
              id: '5',
              title: 'AI Music Composition',
              description: 'Original track created with Soundraw',
              media_url: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&h=600&fit=crop',
              media_type: 'video',
              tools_used: ['Soundraw', 'Mubert'],
              user_id: 'demo-id',
              created_at: new Date(Date.now() - 345600000).toISOString(),
              updated_at: new Date(Date.now() - 345600000).toISOString(),
              is_public: true,
              likes: 68
            },
            {
              id: '6',
              title: 'Robot Character Design',
              description: 'Character concept art generated with Leonardo AI',
              media_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&h=600&fit=crop',
              media_type: 'image',
              tools_used: ['Leonardo AI', 'DALL-E'],
              user_id: 'demo-id',
              created_at: new Date(Date.now() - 432000000).toISOString(),
              updated_at: new Date(Date.now() - 432000000).toISOString(),
              is_public: true,
              likes: 115
            }
          ];
          
          setPortfolioItems(portfolioData.length ? portfolioData : mockPortfolio);
          setLoading(false);
        }, 1500);
      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [username]);
  
  // Filter items based on selected tool
  const filteredItems = filterTool 
    ? portfolioItems.filter(item => item.tools_used.includes(filterTool))
    : portfolioItems;
  
  // Get unique tools for filter
  const uniqueTools = Array.from(
    new Set(portfolioItems.flatMap(item => item.tools_used))
  );
  
  return (
    <div className="max-w-screen-lg mx-auto px-4">
      {/* Profile Header */}
      {loading ? (
        <div className="py-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Skeleton className="h-24 w-24 md:h-36 md:w-36 rounded-full" />
            <div className="flex-1 space-y-4 text-center md:text-left">
              <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex justify-center md:justify-start gap-3 pt-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-8">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ) : (
        <CreatorProfileHeader 
          user={user} 
          portfolio={portfolioItems} 
        />
      )}
      
      {/* Tool Filters */}
      {!loading && uniqueTools.length > 0 && (
        <div className="my-6 flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-sortmy-blue mr-1" />
          <span className="text-sm font-medium mr-2">Filter by tool:</span>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filterTool === null ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilterTool(null)}
              className={filterTool === null ? "bg-sortmy-blue" : ""}
            >
              All
            </Button>
            {uniqueTools.map((tool) => (
              <Button 
                key={tool} 
                variant={filterTool === tool ? "default" : "outline"} 
                size="sm" 
                onClick={() => setFilterTool(tool)}
                className={filterTool === tool ? "bg-sortmy-blue" : ""}
              >
                {tool}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="posts" className="data-[state=active]:bg-sortmy-blue">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className={isMobile ? "hidden" : ""}>Posts</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="reels" className="data-[state=active]:bg-sortmy-blue">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className={isMobile ? "hidden" : ""}>Reels</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="tagged" className="data-[state=active]:bg-sortmy-blue">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className={isMobile ? "hidden" : ""}>Tagged</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          ) : (
            <ContentGrid items={filteredItems} />
          )}
        </TabsContent>
        
        <TabsContent value="reels" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-[9/16] w-full" />
              ))}
            </div>
          ) : (
            <ReelsView items={filteredItems.filter(item => item.media_type === 'video')} />
          )}
        </TabsContent>
        
        <TabsContent value="tagged" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" />
              ))}
            </div>
          ) : (
            <TaggedView />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InstagramStylePortfolio;