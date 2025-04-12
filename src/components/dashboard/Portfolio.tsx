import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortfolioItem, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import CreatorProfileHeader from '@/components/CreatorProfileHeader';
import { PortfolioFilterTools } from '@/components/portfolio/PortfolioFilterTools';
import { PortfolioTabs } from '@/components/portfolio/PortfolioTabs';
import { AddProjectCard } from '@/components/portfolio/AddProjectCard';
import { fetchUserProfile, fetchPortfolioItems } from '@/services/portfolioService';
import { useAuth } from '@/contexts/AuthContext';

const Portfolio = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filterTool, setFilterTool] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        
        let userData: User;
        // If username is provided, fetch that user's profile, otherwise use current user
        if (username) {
          userData = await fetchUserProfile(username);
        } else if (currentUser) {
          userData = currentUser;
        } else {
          throw new Error('No user available');
        }
        
        setUser(userData);
        
        // Fetch portfolio items using the user's ID
        const portfolioData = await fetchPortfolioItems(userData.id);
        setPortfolioItems(portfolioData);
      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [username, currentUser, toast]);
  
  // Filter items based on selected tool
  const filteredItems = filterTool 
    ? portfolioItems.filter(item => item.tools_used.includes(filterTool))
    : portfolioItems;
  
  // Get unique tools for filter
  const uniqueTools = Array.from(
    new Set(portfolioItems.flatMap(item => item.tools_used))
  );
  
  const handleTabChange = (value: string) => {
    // Handle tab change without storing the state
    console.log('Tab changed to:', value);
  };
  
  const handleAddProject = () => {
    navigate('/dashboard/portfolio/add');
  };

  const isCurrentUser = !username || (currentUser && username === currentUser.username);
  
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
      {!loading && (
        <PortfolioFilterTools 
          uniqueTools={uniqueTools} 
          filterTool={filterTool} 
          setFilterTool={setFilterTool} 
        />
      )}
      
      {/* Add Project Card - Only show for current user */}
      {isCurrentUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <AddProjectCard onClick={handleAddProject} />
        </div>
      )}
      
      {/* Content Tabs */}
      <PortfolioTabs 
        loading={loading} 
        filteredItems={filteredItems} 
        onTabChange={handleTabChange} 
      />
    </div>
  );
};

export default Portfolio;
