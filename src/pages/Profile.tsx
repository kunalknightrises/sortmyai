import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import NeuCard from "@/components/ui/NeuCard";
import NeonButton from "@/components/ui/NeonButton";
import HoverEffect from "@/components/ui/HoverEffect";
import ClickEffect from "@/components/ui/ClickEffect";
import AnimatedTooltip from "@/components/ui/AnimatedTooltip";
import EnhancedXPProgress from "@/components/gamification/EnhancedXPProgress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Award, Zap } from 'lucide-react';
// import XPProgress from '@/components/gamification/XPProgress';
import StreakCounter from '@/components/gamification/StreakCounter';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import { Badge as BadgeType } from '@/types/gamification';


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

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

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
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
    if (!user) {
    navigate('/login');
    return null;
  }


  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 max-w-5xl">


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 space-y-6">
            <GlassCard variant="bordered" className="border-sortmy-blue/20">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-sortmy-blue/20 text-sortmy-blue text-2xl">
                      {user?.username ? getInitials(user.username) : 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>

                <h2 className="text-xl font-bold mb-1">{user?.username || 'Username'}</h2>
                <p className="text-gray-400 mb-3">{user?.email || 'email@example.com'}</p>

                {user?.is_premium && (
                  <Badge className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 text-yellow-400 border-yellow-400/30 mb-3">
                    Premium User
                  </Badge>
                )}

                <div className="flex justify-center space-x-4 w-full">
                  <EnhancedXPProgress xp={enhancedUser?.xp || 0} level={enhancedUser?.level || 1} xpForNextLevel={500} />
                  <StreakCounter user={enhancedUser} />
                </div>

                <div className="w-full pt-4">
                  <HoverEffect effect="lift" color="blue">
                    <a href={`/portfolio/${user?.username || ''}`}>
                      <NeonButton variant="gradient" className="w-full">
                        View Public Profile
                      </NeonButton>
                    </a>
                  </HoverEffect>
                </div>
              </CardContent>
            </GlassCard>



            <NeuCard variant="flat" color="dark" className="border-sortmy-blue/10">
              <CardHeader>
                <CardTitle className="text-white">Account Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ClickEffect effect="ripple" color="red">
                  <NeonButton variant="destructive" className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handleLogout}>
                    Logout
                  </NeonButton>
                </ClickEffect>
              </CardContent>
            </NeuCard>
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="profile" className="text-sm">
                  <User className="w-4 h-4 mr-2" />
                  Profile Details
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-sm">
                  <Award className="w-4 h-4 mr-2" />
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4">
                <GlassCard variant="glowing" intensity="low" className="border-sortmy-blue/20">
                  <CardHeader>
                    <CardTitle className="text-white">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Username</label>
                        <input
                          type="text"
                          value={user?.username || ''}
                          className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm focus:border-sortmy-blue focus:ring-sortmy-blue bg-sortmy-darker text-white"
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm focus:border-sortmy-blue focus:ring-sortmy-blue bg-sortmy-darker text-white"
                          disabled
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">Avatar URL</label>
                      <input
                        type="text"
                        value={user?.avatar_url || ''}
                        className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm focus:border-sortmy-blue focus:ring-sortmy-blue bg-sortmy-darker text-white"
                        disabled
                      />
                    </div>

                    <AnimatedTooltip content="This feature is coming soon" position="top">
                      <NeonButton variant="cyan" disabled>
                        Update Profile (Coming Soon)
                      </NeonButton>
                    </AnimatedTooltip>
                  </CardContent>
                </GlassCard>

                <NeuCard variant="elevated" color="purple" className="border-sortmy-blue/20">
                  <CardHeader>
                    <CardTitle className="text-white">Portfolio Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <GlassCard variant="bordered" intensity="low" className="border-sortmy-blue/10">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold">0</div>
                          <p className="text-sm text-gray-400">Total Items</p>
                        </CardContent>
                      </GlassCard>

                      <GlassCard variant="bordered" intensity="low" className="border-sortmy-blue/10">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold">0</div>
                          <p className="text-sm text-gray-400">Total Views</p>
                        </CardContent>
                      </GlassCard>
                    </div>
                  </CardContent>
                </NeuCard>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <GlassCard variant="glowing" intensity="medium" className="border-sortmy-blue/20">
                  <CardHeader>
                    <CardTitle className="text-white">Your Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <NeuCard variant="flat" color="dark" className="border-sortmy-blue/10">
                        <CardContent className="p-4">
                          <div className="flex items-center text-2xl font-bold">
                            <Award className="w-6 h-6 mr-2 text-yellow-400" />
                            {mockBadges.filter(badge => badge.isEarned).length}
                          </div>
                          <p className="text-sm text-gray-400">Badges Earned</p>
                        </CardContent>
                      </NeuCard>

                      <NeuCard variant="flat" color="dark" className="border-sortmy-blue/10">
                        <CardContent className="p-4">
                          <div className="flex items-center text-2xl font-bold">
                            <Zap className="w-6 h-6 mr-2 text-sortmy-blue" />
                            {enhancedUser?.xp || 0}
                          </div>
                          <p className="text-sm text-gray-400">Total XP</p>
                        </CardContent>
                      </NeuCard>
                    </div>

                    <BadgeDisplay badges={mockBadges} />
                  </CardContent>
                </GlassCard>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
