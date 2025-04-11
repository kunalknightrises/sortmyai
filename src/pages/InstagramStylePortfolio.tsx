import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserProfile, fetchPortfolioItems } from '@/services/portfolioService';
import { useToast } from '@/hooks/use-toast';
import { PortfolioItem, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import CreatorProfileHeader from '@/components/CreatorProfileHeader';
import { PortfolioFilterTools } from '@/components/portfolio/PortfolioFilterTools';
import { PortfolioTabs } from '@/components/portfolio/PortfolioTabs';

const InstagramStylePortfolio = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userData = await fetchUserProfile(username || '');
        setUser({
          ...userData,
          // Ensure all required User properties are set
          xp: userData.xp || 0,
          level: userData.level || 1,
          streak_days: userData.streak_days || 0,
          last_login: userData.last_login || new Date().toISOString(),
          badges: userData.badges || [],
          email: userData.email || undefined
        });
        
        // Fetch portfolio items
        if (userData) {
          const items = await fetchPortfolioItems(userData.id);
          setPortfolioItems(items);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load profile',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchData();
    }
  }, [username, toast]);
  
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
      {!loading && (
        <PortfolioFilterTools 
          uniqueTools={Array.from(new Set(portfolioItems.flatMap(item => item.tools_used)))}
          filterTool={null}
          setFilterTool={() => {}}
        />
      )}
      
      {/* Content Tabs */}
      <PortfolioTabs 
        loading={loading} 
        filteredItems={portfolioItems} 
        onTabChange={() => {}}
      />
    </div>
  );
};

export default InstagramStylePortfolio;
