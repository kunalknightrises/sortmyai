
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import XPProgress from '@/components/gamification/XPProgress';
import StreakCounter from '@/components/gamification/StreakCounter';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import AIKnowledgeMeter from '@/components/gamification/AIKnowledgeMeter';
import Leaderboard from '@/components/gamification/Leaderboard';
import { ChallengeCard } from '@/components/gamification/ChallengeCard';
import { useState, useEffect } from 'react';
import { Challenge, Badge, LeaderboardUser } from '@/types/gamification';

const Achievements = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // Mock challenges
    setChallenges([
      {
        id: '1',
        name: 'Tier 1 Boss Challenge',
        description: 'Create an AI portfolio showcasing 3 different tools',
        difficulty: 'boss',
        xpReward: 500,
        badgeReward: 'tier1-master',
        isCompleted: false,
        progress: 1,
        totalSteps: 3
      },
      {
        id: '2',
        name: 'Daily AI Practice',
        description: 'Use at least one AI tool every day for 7 days',
        difficulty: 'medium',
        xpReward: 200,
        isCompleted: false,
        progress: 3,
        totalSteps: 7
      },
      {
        id: '3',
        name: 'Tool Explorer',
        description: 'Try 5 different AI tools and add them to your tracker',
        difficulty: 'easy',
        xpReward: 100,
        isCompleted: false,
        progress: 2,
        totalSteps: 5
      }
    ]);

    // Mock leaderboard data
    setLeaderboardUsers([
      {
        userId: '1',
        username: 'AIExplorer',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        xp: 2500,
        level: 12,
        streakDays: 14,
        badges: 8,
        isPremium: true
      },
      {
        userId: '2',
        username: 'PromptMaster',
        avatarUrl: 'https://i.pravatar.cc/150?img=2',
        xp: 2100,
        level: 10,
        streakDays: 7,
        badges: 6,
        isPremium: false
      },
      {
        userId: '3',
        username: 'AICreator',
        avatarUrl: 'https://i.pravatar.cc/150?img=3',
        xp: 1800,
        level: 9,
        streakDays: 5,
        badges: 5,
        isPremium: true
      },
      {
        userId: user?.uid || '4',
        username: user?.username || 'You',
        avatarUrl: user?.avatar_url,
        xp: user?.xp || 1500,
        level: user?.level || 7,
        streakDays: user?.streak_days || 3,
        badges: user?.badges?.length || 4,
        isPremium: user?.is_premium || false
      }
    ]);
  }, [user]);

  // Mock badge data
  const mockBadges: Badge[] = [
    {
      id: '1',
      name: 'Portfolio Pioneer',
      description: 'Created your first portfolio item',
      icon: '🎯',
      category: 'achievement',
      tier: 'bronze',
      isEarned: true,
      earnedDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'Streak Starter',
      description: 'Maintained a 3-day login streak',
      icon: '🔥',
      category: 'milestone',
      tier: 'bronze',
      isEarned: true,
      earnedDate: '2023-01-18'
    },
    {
      id: '3',
      name: 'Tool Collector',
      description: 'Added 5 tools to your tracker',
      icon: '🧰',
      category: 'achievement',
      tier: 'silver',
      isEarned: true,
      earnedDate: '2023-02-01'
    },
    {
      id: '4',
      name: 'Tier 1 Complete',
      description: 'Completed all Tier 1 challenges',
      icon: '🏆',
      category: 'milestone',
      tier: 'gold',
      isEarned: false
    }
  ];

  const handleChallengeStart = (challengeId: string) => {
    console.log(`Starting challenge: ${challengeId}`);
    // In a real app, you would update the user's progress in Firebase
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your AI Journey</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <XPProgress user={user} />
            <StreakCounter user={user} />
            <AIKnowledgeMeter user={user} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Badges & Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeDisplay badges={mockBadges} />
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(challenge => (
            <ChallengeCard 
              key={challenge.id} 
              challenge={challenge}
              onStart={() => handleChallengeStart(challenge.id)}
            />
          ))}
        </div>
      </div>
      
      <Leaderboard 
        users={leaderboardUsers}
        currentUserId={user?.uid}
        className="mb-8"
      />
    </div>
  );
};

export default Achievements;
