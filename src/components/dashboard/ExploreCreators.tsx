import { useState, useEffect } from 'react';
import { User } from '@/types';
import { fetchCreatorsWithPortfolio, searchCreators } from '@/services/creatorService';
import { CreatorCard } from '@/components/creators/CreatorCard';
import { Input } from '@/components/ui/input';
import { Search, Users, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import { Skeleton } from '@/components/ui/skeleton';

const ExploreCreators = () => {
  const [creators, setCreators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text flex items-center">
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

      <GlassCard variant="bordered" className="border-sortmy-blue/20">
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : creators.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg mb-2">No creators found</p>
          <p className="text-gray-400">
            {searchQuery ? 'Try a different search term' : 'Check back later for new creators'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreCreators;
