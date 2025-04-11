import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Tool, Image, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tool as ToolType, PortfolioItem } from '@/types';
import ToolCard from './dashboard/ToolCard';
import PortfolioCard from './dashboard/PortfolioCard';

// Import the gamification components at the top
import XPProgress from './gamification/XPProgress';
import StreakCounter from './gamification/StreakCounter';

const Dashboard = () => {
  // Add useAuth to get the user information
  const { user } = useAuth();
  const [recentTools, setRecentTools] = useState<ToolType[]>([]);
  const [recentPortfolio, setRecentPortfolio] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Fetch recent tools
        const toolsQuery = query(
          collection(db, 'tools'),
          where('user_id', '==', user.uid),
          orderBy('created_at', 'desc'),
          limit(3)
        );
        
        const toolsSnapshot = await getDocs(toolsQuery);
        const toolsData = toolsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ToolType[];
        
        setRecentTools(toolsData);
        
        // Fetch recent portfolio items
        const portfolioQuery = query(
          collection(db, 'portfolio'),
          where('user_id', '==', user.uid),
          orderBy('created_at', 'desc'),
          limit(3)
        );
        
        const portfolioSnapshot = await getDocs(portfolioQuery);
        const portfolioData = portfolioSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PortfolioItem[];
        
        setRecentPortfolio(portfolioData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add XP and Streak display at the top */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <XPProgress user={user} variant="compact" />
          <StreakCounter user={user} />
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tools">AI Tools</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent AI Tools
                </CardTitle>
                <Tool className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : recentTools.length > 0 ? (
                  <div className="space-y-4">
                    {recentTools.map(tool => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/dashboard/tools">View All Tools</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">You haven't added any AI tools yet</p>
                    <Button asChild>
                      <Link to="/dashboard/tools/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Your First Tool
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recent Portfolio Items
                </CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : recentPortfolio.length > 0 ? (
                  <div className="space-y-4">
                    {recentPortfolio.map(item => (
                      <PortfolioCard key={item.id} item={item} />
                    ))}
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/dashboard/portfolio">View All Portfolio Items</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">You haven't added any portfolio items yet</p>
                    <Button asChild>
                      <Link to="/dashboard/portfolio">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Portfolio Item
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Journey Progress</CardTitle>
              <CardDescription>
                Track your progress in mastering AI tools and building your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <XPProgress user={user} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tools Added</CardTitle>
                      <Tool className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{recentTools.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Portfolio Items</CardTitle>
                      <Image className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{recentPortfolio.length}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">XP Earned</CardTitle>
                      <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{user?.xp || 0}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tools" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Your AI Tools</h2>
            <Button asChild>
              <Link to="/dashboard/tools/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Tool
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recentTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't added any AI tools yet</p>
                <Button asChild>
                  <Link to="/dashboard/tools/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Tool
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/dashboard/tools">View All Tools</Link>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Your Portfolio</h2>
            <Button asChild>
              <Link to="/dashboard/portfolio">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Portfolio Item
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recentPortfolio.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPortfolio.map(item => (
                <PortfolioCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't added any portfolio items yet</p>
                <Button asChild>
                  <Link to="/dashboard/portfolio">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Portfolio Item
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/dashboard/portfolio">View All Portfolio Items</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
