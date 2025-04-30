import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBackground } from '@/contexts/BackgroundContext';
import { User } from '@/types';
import { fetchCreatorsWithPortfolio, searchCreators } from '@/services/creatorService';
import { CreatorCard } from '@/components/creators/CreatorCard';
import { Input } from '@/components/ui/input';
import { Search, Users, RefreshCw, Lock, Sparkles, Trophy, Crown, Users2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { Button } from '@/components/ui/button';


const ExploreCreators = () => {
  const [creators, setCreators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { cycleBackgroundType } = useBackground();
  const { toast } = useToast();
  const { user } = useAuth();
  const location = useLocation();

  // Check if we're in the dashboard layout
  const isInDashboard = location.pathname.includes('/dashboard');

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const data = await fetchCreatorsWithPortfolio();
      setCreators(data);
    } catch (error) {
      console.error('Error fetching creators:', error);
      toast({
        title: 'Error',
        description: 'Failed to load creators. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const results = await searchCreators(searchQuery);
      setCreators(results);
    } catch (error) {
      console.error('Error searching creators:', error);
      toast({
        title: 'Error',
        description: 'Failed to search creators. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, []);

  return (
    <div className="space-y-8 relative px-4 sm:px-6 md:px-8 py-6 max-w-7xl mx-auto">
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>          <h1 className="text-3xl font-bold text-white flex items-center">
            <Users className="w-8 h-8 mr-2 text-sortmy-blue" />
            Explore Creators
          </h1>
          <p className="text-gray-400 mt-1">
            Discover talented AI creators and their portfolios
          </p>
        </div>

        <ClickEffect effect="ripple" color="blue">
          <NeonButton
            variant="cyan"
            onClick={fetchCreators}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </NeonButton>
        </ClickEffect>
      </div>

      <GlassCard variant="bordered" className="border-sortmy-blue/20 relative z-10">
        <div className="p-4">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sortmy-blue" size={18} />
            <Input
              placeholder="Search creators by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-sortmy-gray/10 border-sortmy-blue/20 focus:border-sortmy-blue/50 transition-colors"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <ClickEffect effect="ripple" color="blue">
                <NeonButton
                  variant="cyan"
                  size="sm"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </NeonButton>
              </ClickEffect>
            </div>
          </div>
        </div>
      </GlassCard>

      {!user && (
        <GlassCard variant="bordered" className="border-sortmy-blue/20 relative z-10 bg-sortmy-blue/10">
          <div className="p-6 text-center">
            <Lock className="w-8 h-8 mx-auto mb-3 text-sortmy-blue" />
            <h3 className="text-xl font-bold mb-2">Sign Up to Follow Creators</h3>
            <p className="text-gray-300 mb-4">Create an account to follow creators and view their full profiles</p>
            <div className="flex justify-center gap-4">
              <ClickEffect effect="ripple" color="blue">
                <Link to="/login">
                  <NeonButton variant="cyan">
                    Log In
                  </NeonButton>
                </Link>
              </ClickEffect>
              <ClickEffect effect="ripple" color="blue">
                <Link to="/signup">
                  <NeonButton variant="gradient">
                    Sign Up
                  </NeonButton>
                </Link>
              </ClickEffect>
            </div>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-sortmy-dark/50 border border-sortmy-blue/20 rounded-lg p-6 flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="flex justify-center gap-6 mb-4">
                <div className="text-center">
                  <Skeleton className="h-5 w-8 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-5 w-8 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-auto">
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-12 relative z-10">
          <p className="text-lg mb-2">No creators found</p>
          <p className="text-gray-400">
            {searchQuery ? 'Try a different search term' : 'Check back later for new creators'}
          </p>
        </div>      ) : (
        <div className="flex gap-6 relative z-10">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator) => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </div>
            {/* Leaderboard Preview */}
          <div className="hidden xl:block w-80">
            <div className="sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-sortmy-blue/20 scrollbar-track-sortmy-darker">
              <LeaderboardPreview />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LeaderboardPreview = () => {
  return (
    <Card className="bg-sortmy-gray/10 border-sortmy-blue/20 relative overflow-hidden backdrop-blur-sm">
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-sortmy-darker/30 backdrop-blur-[2px] z-0" />
      
      <CardContent className="relative z-10 p-6">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <Trophy className="w-12 h-12 text-sortmy-blue/80 animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">Creator Leaderboard</h3>
              <p className="text-sm text-gray-400">
                Compete with other creators and climb the ranks!
              </p>
            </div>
          </div>

          {/* Preview Rankings */}
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

          {/* Stats Preview */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-3 rounded-lg bg-sortmy-darker/50 border border-sortmy-gray/10 text-center">
              <p className="text-xs text-gray-400">Total Creators</p>
              <div className="h-3 w-12 bg-sortmy-gray/20 rounded mx-auto mt-2" />
            </div>
            <div className="p-3 rounded-lg bg-sortmy-darker/50 border border-sortmy-gray/10 text-center">
              <p className="text-xs text-gray-400">Total XP</p>
              <div className="h-3 w-12 bg-sortmy-gray/20 rounded mx-auto mt-2" />
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div>
            <Badge variant="outline" className="bg-sortmy-blue/10 text-sortmy-blue">
              Coming Soon
            </Badge>
          </div>

          {/* Feature List */}
          <div className="w-full space-y-2 text-left">
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <Star className="w-4 h-4 text-sortmy-blue" />
              Global & Regional Rankings
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <Crown className="w-4 h-4 text-sortmy-blue" />
              Monthly Competitions
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <Users2 className="w-4 h-4 text-sortmy-blue" />
              Creator Achievements
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExploreCreators;
