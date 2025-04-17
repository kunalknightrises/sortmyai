
import { useState, useEffect } from 'react';
import { useBackground } from '@/contexts/BackgroundContext';
import { useParams, Link } from 'react-router-dom';
import { fetchUserProfile, fetchPortfolioItems } from '@/services/portfolioService';
import { useToast } from '@/hooks/use-toast';
import { PortfolioItem, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import CreatorProfileHeader from '@/components/CreatorProfileHeader';
import { PortfolioFilterTools } from '@/components/portfolio/PortfolioFilterTools';
import { PortfolioTabs } from '@/components/portfolio/PortfolioTabs';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import { NavLink } from 'react-router-dom';
import SynthwaveBackground from '@/components/ui/SynthwaveBackground';
import AuroraBackground from '@/components/ui/AuroraBackground';
import {
  LayoutDashboard,
  Briefcase,
  LayoutGrid,
  User as UserIcon,
  Settings,
  Brain,
  GraduationCap,
  Sparkles,
  Users,
  Lock
} from 'lucide-react';

const InstagramStylePortfolio = () => {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const { backgroundType, cycleBackgroundType } = useBackground();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

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

  // Sidebar component for authenticated users
  const Sidebar = () => {
    const sidebarItems = [
      { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
      { icon: <Briefcase size={20} />, label: "Tool Tracker", path: "/dashboard/tools" },
      { icon: <LayoutGrid size={20} />, label: "Portfolio", path: "/dashboard/portfolio" },
      { icon: <Users size={20} />, label: "Explore Creators", path: "/dashboard/explore-creators" },
      { icon: <GraduationCap size={20} />, label: "Academy", path: "/dashboard/academy" },
      { icon: <UserIcon size={20} />, label: "Profile", path: "/dashboard/profile" },
      { icon: <Settings size={20} />, label: "Settings", path: "/dashboard/settings" },
    ];

    return (
      <div className="border-r border-sortmy-blue/20 bg-sortmy-darker/70 backdrop-blur-md w-64 flex-shrink-0 p-4 h-screen sticky top-0 left-0 overflow-y-auto">
        <div className="flex items-center mb-8 py-2">
          <div className="relative">
            <Brain className="w-8 h-8 mr-2 text-sortmy-blue" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-sortmy-blue animate-pulse" />
          </div>
          <Link to="/dashboard" className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#0066ff] to-[#4d94ff] text-transparent bg-clip-text">SortMyAI</Link>
        </div>

        <div className="flex-1 flex flex-col space-y-1">
          {sidebarItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 py-3 px-4 rounded-md transition-colors
                ${isActive
                  ? 'bg-sortmy-blue/20 text-sortmy-blue'
                  : 'hover:bg-sortmy-gray/20 text-gray-300 hover:text-white'}
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-sortmy-dark relative">
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

      {/* Sidebar for authenticated users */}
      {currentUser && <Sidebar />}

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-sortmy-darker/70 border-sortmy-blue/20"
          onClick={cycleBackgroundType}
          title="Toggle Background Style"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>

      <div className={`flex-1 p-4 overflow-y-auto z-10 relative ${currentUser ? 'ml-0' : ''}`}>
        <div className="max-w-screen-lg mx-auto px-4 relative z-10">
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
              isCurrentUser={currentUser?.username === user?.username}
            />
          )}

          {/* Sign up prompt for non-authenticated users */}
          {!currentUser && (
            <div className="mb-6 p-4 bg-sortmy-blue/10 border border-sortmy-blue/20 rounded-lg text-center">
              <Lock className="w-6 h-6 mx-auto mb-2 text-sortmy-blue" />
              <h3 className="text-lg font-medium mb-2">Sign Up to Follow This Creator</h3>
              <p className="text-gray-300 mb-4">Create an account to follow creators and interact with their content</p>
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
            isOwner={currentUser?.username === user?.username}
          />
        </div>
      </div>
    </div>
  );
};

export default InstagramStylePortfolio;
