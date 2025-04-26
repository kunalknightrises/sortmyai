import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Briefcase, LayoutGrid, ArrowRight, Activity, Award, Target, Zap, Image, Video, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import XPProgress from './gamification/XPProgress';
import StreakCounter from './gamification/StreakCounter';
import BadgeDisplay from './gamification/BadgeDisplay';
import AIKnowledgeMeter from './gamification/AIKnowledgeMeter';
import { Badge as BadgeType } from '@/types/gamification';
import EnhancedXPProgress from './gamification/EnhancedXPProgress';
// import EnhancedStreakCounter from './gamification/EnhancedStreakCounter';
import GlassCard from './ui/GlassCard';
import NeuCard from './ui/NeuCard';
import NeonButton from './ui/NeonButton';
import HoverEffect from './ui/HoverEffect';
import ClickEffect from './ui/ClickEffect';
import AnimatedTooltip from './ui/AnimatedTooltip';
import AISuggestion from './ui/AISuggestion';
import { fetchPortfolioItems } from '@/services/portfolioService';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PortfolioItem, Tool } from '@/types';
// import { Skeleton } from '@/components/ui/skeleton';
import NeonSkeleton from './ui/NeonSkeleton';

const mockBadges: BadgeType[] = [
  {
    id: 'badge1',
    name: 'First Login',
    description: 'Logged in for the first time',
    icon: 'login',
    category: 'milestone',
    tier: 'bronze',
    isEarned: true,
    earnedDate: new Date().toISOString()
  },
  {
    id: 'badge2',
    name: 'Tool Master',
    description: 'Added 5 AI tools to your tracker',
    icon: 'tools',
    category: 'achievement',
    tier: 'silver',
    isEarned: true,
    earnedDate: new Date().toISOString()
  },
  {
    id: 'badge3',
    name: 'AI Explorer',
    description: 'Reached level 5',
    icon: 'explore',
    category: 'milestone',
    tier: 'gold',
    isEarned: false
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState({
    portfolio: true,
    tools: true
  });

  // Fetch portfolio items and tools
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch portfolio items
        setLoading(prev => ({ ...prev, portfolio: true }));
        const items = await fetchPortfolioItems(user.id);
        setPortfolioItems(items);
        setLoading(prev => ({ ...prev, portfolio: false }));

        // Fetch tools
        setLoading(prev => ({ ...prev, tools: true }));
        const toolsRef = collection(db, 'tools');
        // Try to fetch with orderBy, but fall back to just the where clause if it fails
        let toolsList: Tool[] = [];
        try {
          const q = query(
            toolsRef,
            where('user_id', '==', user.id),
            orderBy('created_at', 'desc'),
            limit(3)
          );
          const querySnapshot = await getDocs(q);
          toolsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Tool[];
        } catch (error) {
          console.warn('Error with ordered query, falling back to basic query:', error);
          // Fall back to a simpler query without orderBy
          const fallbackQ = query(
            toolsRef,
            where('user_id', '==', user.id),
            limit(3)
          );
          const fallbackSnapshot = await getDocs(fallbackQ);
          toolsList = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Tool[];
        }
        // Query is now handled in the try/catch block above
        setTools(toolsList);
        setLoading(prev => ({ ...prev, tools: false }));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading({ portfolio: false, tools: false });
      }
    };

    fetchData();
  }, [user]);

  const enhancedUser = React.useMemo(() => {
    if (!user) return null;

    return {
      ...user,
      email: user.email || undefined,
      xp: user.xp || 250,
      level: user.level || 3,
      streak_days: user.streak_days || 5,
      last_login: user.last_login || new Date().toISOString(),
      badges: user.badges || ['badge1', 'badge2'],
      ai_knowledge: user.ai_knowledge || {
        overall: 8,
        categories: {
          'Text Generation': 12,
          'Image Creation': 6,
          'Voice Synthesis': 4,
          'Data Analysis': 9,
          'Prompt Engineering': 15
        }
      }
    };
  }, [user]);

  return (
    <div className="flex h-screen text-white overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-8 max-w-7xl mx-auto">
              <div className="flex justify-end items-center mb-4">
                <ClickEffect effect="ripple" color="blue">
                  <Link to="/dashboard/tools/add">
                    <NeonButton variant="gradient">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add a Tool
                    </NeonButton>
                  </Link>
                </ClickEffect>
              </div>

              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <h2 className="text-xl font-semibold">Welcome back, {user?.username || 'Creator'}</h2>

                  <div className="mt-2 md:mt-0 flex items-center gap-4">
                    <XPProgress user={enhancedUser} variant="compact" />
                    <StreakCounter user={enhancedUser} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatsCard
                    title="AI Tools"
                    value={tools.length.toString()}
                    description="Tools tracked"
                    icon={<Briefcase className="w-5 h-5 text-sortmy-blue" />}
                    link="/dashboard/tools"
                  />
                  <StatsCard
                    title="Portfolio Items"
                    value={portfolioItems.length.toString()}
                    description="Works published"
                    icon={<LayoutGrid className="w-5 h-5 text-sortmy-blue" />}
                    link="/dashboard/portfolio"
                  />
                  <StatsCard
                    title="Analytics"
                    value="View"
                    description="Track your engagement"
                    icon={<BarChart2 className="w-5 h-5 text-sortmy-blue" />}
                    link="/dashboard/analytics"
                  />

                </div>
              </div>

              {/* AI Suggestion */}
              <div className="mb-6">
                <AISuggestion
                  suggestion="Based on your activity, you might want to try tracking Midjourney in your AI tools collection."
                  actionText="Add Midjourney"
                  onAction={() => window.location.href = '/dashboard/tools/add'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <GlassCard variant="bordered" className="col-span-2 border-sortmy-blue/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-sortmy-blue" />
                      <span className="bg-gradient-to-r from-[#0066ff] to-[#4d94ff] text-transparent bg-clip-text font-bold">Your Progress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-300">XP Progress</span>
                        <span className="text-sm font-medium text-sortmy-blue">{enhancedUser?.xp || 0} / 500 XP</span>
                      </div>
                      <EnhancedXPProgress
                        xp={enhancedUser?.xp || 0}
                        level={enhancedUser?.level || 1}
                        xpForNextLevel={500}
                      />
                    </div>

                    <BadgeDisplay badges={mockBadges} className="pt-2" />

                    <div className="pt-2">
                      <Link to="/dashboard/achievements" className="w-full">
                        <NeonButton variant="magenta" size="sm" className="w-full">
                          <span className="flex items-center justify-center text-white">
                            <Award className="w-4 h-4 mr-2" />
                            View All Achievements
                          </span>
                        </NeonButton>
                      </Link>
                    </div>
                  </CardContent>
                </GlassCard>

                <NeuCard variant="elevated" color="purple" className="border border-sortmy-blue/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Target className="w-5 h-5 mr-2 text-sortmy-blue" />
                      <span className="text-white font-bold">Daily Challenge</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-sortmy-gray/10 rounded-lg p-4 mb-4 border border-sortmy-blue/10">
                      <h3 className="font-medium mb-2 text-white">Add Your First Tool</h3>
                      <p className="text-sm text-gray-300 mb-4">Track an AI tool you use regularly and earn 50 XP!</p>
                      <div className="flex items-center text-sm mb-3">
                        <AnimatedTooltip content="Complete this to earn XP" position="top">
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-1 text-sortmy-blue" />
                            <span className="text-[#03ABEE]">50 XP Reward</span>
                          </div>
                        </AnimatedTooltip>
                      </div>
                      <HoverEffect effect="lift" color="blue">
                        <Link to="/dashboard/tools/add">
                          <NeonButton variant="gradient" size="sm">Start Now</NeonButton>
                        </Link>
                      </HoverEffect>
                    </div>

                    <AIKnowledgeMeter user={enhancedUser} />
                  </CardContent>
                </NeuCard>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <NeuCard variant="flat" color="dark" className="border border-sortmy-blue/10">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-sortmy-blue" />
                        <span className="text-white">Recent Tools</span>
                      </CardTitle>
                      <Link to="/dashboard/tools">
                        <NeonButton variant="magenta" size="sm" className="text-xs">
                          <span className="flex items-center text-white">View All <ArrowRight className="w-4 h-4 ml-1" /></span>
                        </NeonButton>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading.tools ? (
                      <div className="space-y-4">
                        <NeonSkeleton height="48px" className="w-full" />
                        <NeonSkeleton height="48px" className="w-full" />
                        <NeonSkeleton height="48px" className="w-full" />
                      </div>
                    ) : tools.length > 0 ? (
                      <div className="space-y-3">
                        {tools.map(tool => (
                          <div key={tool.id} className="flex items-center p-2 rounded-md hover:bg-sortmy-gray/20">
                            <div className="w-8 h-8 rounded-full bg-sortmy-gray/30 flex items-center justify-center mr-3">
                              {tool.logo_url ? (
                                <img src={tool.logo_url} alt={tool.name} className="w-6 h-6 rounded-full" />
                              ) : (
                                <Briefcase className="w-4 h-4 text-[#ff00cc]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{tool.name}</h4>
                              <p className="text-xs text-gray-400 truncate">{tool.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-400">
                        <Briefcase className="mx-auto w-12 h-12 mb-3 opacity-30" />
                        <p>You haven't added any tools yet</p>
                        <div className="flex justify-center mt-4">
                          <ClickEffect effect="bounce" color="blue">
                            <Link to="/dashboard/tools/add">
                              <NeonButton variant="magenta" size="sm">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Add Your First Tool
                              </NeonButton>
                            </Link>
                          </ClickEffect>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </NeuCard>

                <GlassCard variant="bordered" intensity="low" className="border-sortmy-blue/20">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center">
                        <LayoutGrid className="w-5 h-5 mr-2 text-sortmy-blue" />
                        <span className="text-white">Recent Portfolio Items</span>
                      </CardTitle>
                      <Link to="/dashboard/portfolio">
                        <NeonButton variant="cyan" size="sm" className="text-xs">
                          <span className="flex items-center text-white">View All <ArrowRight className="w-4 h-4 ml-1" /></span>
                        </NeonButton>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading.portfolio ? (
                      <div className="space-y-4">
                        <NeonSkeleton height="48px" className="w-full" />
                        <NeonSkeleton height="48px" className="w-full" />
                        <NeonSkeleton height="48px" className="w-full" />
                      </div>
                    ) : portfolioItems.length > 0 ? (
                      <div className="space-y-3">
                        {portfolioItems.slice(0, 3).map(item => (
                          <HoverEffect effect="lift" key={item.id} className="flex items-center p-2 rounded-md">
                            <div className="w-10 h-10 rounded-md bg-sortmy-gray/30 flex items-center justify-center mr-3 overflow-hidden">
                              {item.media_url ? (
                                item.media_type === 'image' ? (
                                  <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Video className="w-5 h-5 text-sortmy-blue" />
                                )
                              ) : (
                                <Image className="w-5 h-5 text-sortmy-blue" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{item.title}</h4>
                              <p className="text-xs text-gray-400 truncate">{item.description}</p>
                            </div>
                          </HoverEffect>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-gray-400">
                        <LayoutGrid className="mx-auto w-12 h-12 mb-3 opacity-30" />
                        <p>You haven't added any portfolio items yet</p>
                        <div className="flex justify-center mt-4">
                          <ClickEffect effect="particles" color="blue">
                            <Link to="/dashboard/portfolio/add">
                              <NeonButton variant="cyan" size="sm">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Create Your First Portfolio Item
                              </NeonButton>
                            </Link>
                          </ClickEffect>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </GlassCard>
              </div>
            </div>
        </div>
      </div>
  );
};

const StatsCard = ({ title, value, description, icon, link }: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  link?: string;
}) => {
  return (
    <GlassCard variant="glowing" intensity="medium" className="border-sortmy-blue/20 hover:border-sortmy-blue/40 transition-all duration-300 cursor-pointer">
      <Link to={link || '#'}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="bg-sortmy-gray/20 p-2 rounded-full border border-sortmy-blue/20">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#03ABEE]">{value}</div>
          <p className="text-xs text-gray-300 mt-1">{description}</p>
        </CardContent>
      </Link>
    </GlassCard>
  );
};

export default Dashboard;
