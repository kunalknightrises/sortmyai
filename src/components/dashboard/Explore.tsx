import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBackground } from '@/contexts/BackgroundContext';
import { Users, ImageIcon } from 'lucide-react';
import AuroraBackground from '@/components/ui/AuroraBackground';
import ExploreCreators from './ExploreCreators';
import ExplorePosts from './ExplorePosts';
import GlassCard from '@/components/ui/GlassCard';

const Explore = () => {
  const { backgroundType } = useBackground();
  const location = useLocation();
  
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
