import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Medal, Target, Trophy, Users, Sparkles } from 'lucide-react';
// import XPProgress from '@/components/gamification/XPProgress';
import ChallengeCard from '@/components/gamification/ChallengeCard';
import Leaderboard from '@/components/gamification/Leaderboard';
import { Badge as BadgeType, Challenge, LeaderboardUser } from '@/types/gamification';
import GlassCard from '@/components/ui/GlassCard';
// import NeuCard from '@/components/ui/NeuCard';
// import NeonButton from '@/components/ui/NeonButton';
import HoverEffect from '@/components/ui/HoverEffect';
// import ClickEffect from '@/components/ui/ClickEffect';
import EnhancedXPProgress from '@/components/gamification/EnhancedXPProgress';

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
    name: 'Getting Started',
    description: 'Completed your first challenge',
    icon: 'star',
    category: 'milestone',
    tier: 'bronze',
    isEarned: true,
    earnedDate: new Date().toISOString()
  },
  {
    id: 'badge4',
    name: 'AI Explorer',
    description: 'Reached level 5',
    icon: 'explore',
    category: 'milestone',
    tier: 'gold',
    isEarned: false
  },
  {
    id: 'badge5',
    name: 'Prompt Engineer',
    description: 'Master the art of prompt engineering',
    icon: 'code',
    category: 'skill',
    tier: 'silver',
    isEarned: false
  },
  {
    id: 'badge6',
    name: 'Consistent Creator',
    description: 'Maintain a 7-day streak',
    icon: 'calendar',
    category: 'achievement',
    tier: 'gold',
    isEarned: false
  },
  {
    id: 'badge7',
    name: 'Portfolio Pro',
    description: 'Create 10 portfolio items',
    icon: 'grid',
    category: 'achievement',
    tier: 'platinum',
    isEarned: false
  }
];

const mockChallenges: Challenge[] = [
  {
    id: 'challenge1',
    name: 'Get Started with AI Tools',
    description: 'Add your first AI tool to the tracker',
    difficulty: 'easy',
    xpReward: 50,
    badgeReward: 'Getting Started',
    isCompleted: false,
    progress: 0,
    totalSteps: 1
  },
  {
    id: 'challenge2',
    name: 'Tool Collection',
    description: 'Track 5 different AI tools you use',
    difficulty: 'medium',
    xpReward: 100,
    badgeReward: 'Tool Master',
    isCompleted: false,
    progress: 2,
    totalSteps: 5
  },
  {
    id: 'challenge3',
    name: 'Prompt Engineering 101',
    description: 'Complete the prompt engineering basics tutorial',
    difficulty: 'medium',
    xpReward: 150,
    badgeReward: 'Prompt Engineer',
    isCompleted: false,
    progress: 0,
    totalSteps: 5
  },
  {
    id: 'challenge4',
    name: 'AI Generation Boss Challenge',
    description: 'Master image, text, and voice generation in one project',
    difficulty: 'boss',
    xpReward: 500,
    badgeReward: 'Creative Mastermind',
    isCompleted: false,
    progress: 0,
    totalSteps: 3
  }
];

const mockLeaderboard: LeaderboardUser[] = [
  {
    userId: 'user1',
    username: 'AImaster42',
    xp: 1250,
    level: 8,
    streakDays: 12,
    badges: 15,
    isPremium: true
  },
  {
    userId: 'user2',
    username: 'PromptQueen',
    xp: 980,
    level: 7,
    streakDays: 5,
    badges: 10,
    isPremium: false
  },
  {
    userId: 'current',
    username: 'YourUsername',
    xp: 250,
    level: 3,
    streakDays: 5,
    badges: 3,
    isPremium: false
  },
  {
    userId: 'user4',
    username: 'AInovator',
    xp: 210,
    level: 2,
    streakDays: 2,
    badges: 2,
    isPremium: false
  },
  {
    userId: 'user5',
    username: 'DigitalDreamer',
    xp: 180,
    level: 2,
    streakDays: 0,
    badges: 1,
    isPremium: true
  }
];

const Achievements = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('badges');

  const enhancedUser = React.useMemo(() => {
    if (!user) return null;

    return {
      ...user,
      email: user.email || undefined,
      xp: user.xp || 250,
      level: user.level || 3,
      streak_days: user.streak_days || 5,
      last_login: user.last_login || new Date().toISOString(),
      badges: user.badges || ['badge1', 'badge2', 'badge3'],
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

  const earnedBadges = mockBadges.filter(badge => badge.isEarned);
  const unlockedBadges = mockBadges.filter(badge => !badge.isEarned);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text flex items-center">
        <Trophy className="w-8 h-8 mr-2 text-sortmy-blue" />
        Achievements
      </h1>

      <GlassCard variant="bordered" className="border-sortmy-blue/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-sortmy-blue" />
                Experience
              </h3>
              <EnhancedXPProgress xp={enhancedUser?.xp || 0} level={enhancedUser?.level || 1} xpForNextLevel={500} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-400" />
                Badges
              </h3>
              <div className="flex items-center gap-2">
                <HoverEffect effect="lift" color="blue" className="bg-sortmy-blue/10 p-3 rounded-lg flex-1">
                  <div className="text-2xl font-bold">{earnedBadges.length}</div>
                  <p className="text-xs text-gray-400">Earned</p>
                </HoverEffect>
                <HoverEffect effect="lift" color="blue" className="bg-sortmy-gray/20 p-3 rounded-lg flex-1">
                  <div className="text-2xl font-bold">{unlockedBadges.length}</div>
                  <p className="text-xs text-gray-400">Locked</p>
                </HoverEffect>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-orange-400" />
                Challenges
              </h3>
              <div className="flex items-center gap-2">
                <HoverEffect effect="lift" color="blue" className="bg-sortmy-blue/10 p-3 rounded-lg flex-1">
                  <div className="text-2xl font-bold">
                    {mockChallenges.filter(c => c.isCompleted).length}
                  </div>
                  <p className="text-xs text-gray-400">Completed</p>
                </HoverEffect>
                <HoverEffect effect="lift" color="blue" className="bg-sortmy-gray/20 p-3 rounded-lg flex-1">
                  <div className="text-2xl font-bold">
                    {mockChallenges.filter(c => !c.isCompleted).length}
                  </div>
                  <p className="text-xs text-gray-400">In Progress</p>
                </HoverEffect>
              </div>
            </div>
          </div>
        </CardContent>
      </GlassCard>

      <Tabs defaultValue="badges" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full md:w-auto bg-sortmy-darker border border-sortmy-blue/20">
          <TabsTrigger value="badges" className="flex items-center">
            <Award className="w-4 h-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Medal className="w-5 h-5 mr-2 text-yellow-400" />
              Earned Badges
            </h2>

            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {earnedBadges.map(badge => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            ) : (
              <GlassCard variant="bordered" className="border-sortmy-blue/20 p-8 text-center">
                <Award className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium mb-2">No Badges Yet</h3>
                <p className="text-sm text-gray-400">
                  Complete challenges and use the platform to earn your first badge!
                </p>
              </GlassCard>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-gray-400" />
              Locked Badges
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {unlockedBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-sortmy-blue" />
              Active Challenges
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockChallenges
                .filter(challenge => !challenge.isCompleted)
                .map(challenge => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onStart={() => console.log('Starting challenge:', challenge.id)}
                  />
                ))
              }
            </div>
          </div>

          {mockChallenges.some(c => c.isCompleted) && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Completed Challenges
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockChallenges
                  .filter(challenge => challenge.isCompleted)
                  .map(challenge => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                    />
                  ))
                }
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard
            users={mockLeaderboard}
            currentUserId="current"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BadgeCard = ({ badge }: { badge: BadgeType }) => {
  const getBadgeTierClass = (tier: BadgeType['tier']) => {
    switch (tier) {
      case 'bronze':
        return 'bg-amber-700/20 border-amber-700/30 text-amber-700';
      case 'silver':
        return 'bg-gray-300/20 border-gray-300/30 text-gray-300';
      case 'gold':
        return 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400';
      case 'platinum':
        return 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-purple-500/30 text-purple-400';
      default:
        return 'bg-sortmy-gray/20 border-sortmy-gray/30 text-gray-400';
    }
  };

  return (
    <div className="h-full">
      <GlassCard variant="bordered" className={`border-sortmy-blue/20 ${!badge.isEarned ? 'opacity-70' : ''} hover:translate-y-[-5px] hover:shadow-lg transition-all duration-300`}>
      <CardHeader className="text-center pb-2">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${getBadgeTierClass(badge.tier)} border`}>
          <span className="text-3xl">
            {badge.category === 'achievement' && '🏆'}
            {badge.category === 'milestone' && '🌟'}
            {badge.category === 'skill' && '⚡'}
            {badge.category === 'special' && '🎯'}
          </span>
        </div>
        <CardTitle className="mt-2 text-center">
          {badge.name}
        </CardTitle>
        <CardDescription className="text-center">
          {badge.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center pt-2">
        <Badge
          variant="outline"
          className={`uppercase ${getBadgeTierClass(badge.tier)} border`}
        >
          {badge.tier}
        </Badge>
        {badge.isEarned && badge.earnedDate && (
          <p className="text-xs text-gray-400 mt-2">
            Earned on {new Date(badge.earnedDate).toLocaleDateString()}
          </p>
        )}
        {!badge.isEarned && badge.requiredXP && (
          <p className="text-xs text-gray-400 mt-2">
            Requires {badge.requiredXP} XP
          </p>
        )}
      </CardContent>
    </GlassCard>
    </div>
  );
};

export default Achievements;
