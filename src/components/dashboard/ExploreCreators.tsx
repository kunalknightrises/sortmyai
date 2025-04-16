import { useState, useEffect } from 'react';
import { User } from '@/types';
import { fetchCreatorsWithPortfolio, searchCreators } from '@/services/creatorService';
import { CreatorCard } from '@/components/creators/CreatorCard';
import { Input } from '@/components/ui/input';
import { Search, Users, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import SynthwaveBackground from '@/components/ui/SynthwaveBackground';
import AuroraBackground from '@/components/ui/AuroraBackground';

const ExploreCreators = () => {
  const [creators, setCreators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [backgroundType, setBackgroundType] = useState<'aurora' | 'synthwave' | 'simple'>('simple');
  const { toast } = useToast();
  const { user } = useAuth();

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
    <div className="space-y-8 relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {backgroundType === 'aurora' && (
          <AuroraBackground intensity={50} className="z-0" />
        )}
        {backgroundType === 'synthwave' && (
          <SynthwaveBackground intensity="low" className="z-0" />
        )}
        {backgroundType === 'simple' && (
          <div className="absolute inset-0 bg-sortmy-dark">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d001a] to-[#0a0a2e] opacity-80"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-sortmy-darker/70 border-sortmy-blue/20"
          onClick={() => {
            setBackgroundType(prev => {
              if (prev === 'simple') return 'synthwave';
              if (prev === 'synthwave') return 'aurora';
              return 'simple';
            });
          }}
          title="Toggle Background Style"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
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
                <Skeleton className="h-9 w-24" />
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreCreators;
