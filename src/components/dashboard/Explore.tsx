import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBackground } from '@/contexts/BackgroundContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Users, ImageIcon } from 'lucide-react';
import AuroraBackground from '@/components/ui/AuroraBackground';
import ExploreCreators from './ExploreCreators';
import ExplorePosts from './ExplorePosts';
import GlassCard from '@/components/ui/GlassCard';

const Explore = () => {
  const { backgroundType, cycleBackgroundType } = useBackground();
  const location = useLocation();
  const isInDashboard = location.pathname.includes('/dashboard');
  
  // Initialize view from URL state or default to 'posts'
  const [view, setView] = useState<'creators' | 'posts'>(
    (location.state as { view?: 'creators' | 'posts' })?.view || 'posts'
  );

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
              {view === 'creators' ? (
                <Users className="w-8 h-8 mr-2 text-sortmy-blue" />
              ) : (
                <ImageIcon className="w-8 h-8 mr-2 text-sortmy-blue" />
              )}
              Explore {view === 'creators' ? 'Creators' : 'Posts'}
            </h1>
            <p className="text-gray-400 mt-1">
              {view === 'creators' 
                ? 'Discover talented AI creators and their portfolios'
                : 'Discover amazing AI creations from the community'
              }
            </p>
          </div>

          <div className="flex items-center gap-4">
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
        </div>

        {/* View Toggle */}
        <GlassCard className="mb-6">
          <Tabs 
            value={view} 
            onValueChange={(value) => setView(value as 'creators' | 'posts')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="creators" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Creators
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Posts
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </GlassCard>

        {/* Content based on view */}
        {view === 'creators' ? (
          <div className="transition-all duration-300 ease-in-out">
            <ExploreCreators />
          </div>
        ) : (
          <div className="transition-all duration-300 ease-in-out">
            <ExplorePosts />
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
