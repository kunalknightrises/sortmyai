import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, LayoutGrid, Award, Clock, Settings, Zap } from 'lucide-react';
import XPProgress from '@/components/gamification/XPProgress';
import StreakCounter from '@/components/gamification/StreakCounter';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import { Badge as BadgeType } from '@/types/gamification';

// Mock data for development - would come from backend in production
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
  
  // Mock gamification data if not present in user
  const enhancedUser = React.useMemo(() => {
    if (!user) return null;
    
    return {
      ...user,
      id: user.uid, // Add id property based on uid to match User type
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
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-gray-400">Manage your personal information and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
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
                <XPProgress user={enhancedUser} variant="compact" />
                <StreakCounter user={enhancedUser} />
              </div>
              
              <div className="w-full pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/portfolio/${user?.username || ''}`}>
                    View Public Profile
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Account Management Section */}
          <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Details and Achievements */}
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
              <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Username</label>
                      <input
                        type="text"
                        value={user?.username || ''}
                        className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-sortmy-blue focus:ring-sortmy-blue bg-sortmy-dark text-white"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-sortmy-blue focus:ring-sortmy-blue bg-sortmy-dark text-white"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Avatar URL</label>
                    <input
                      type="text"
                      value={user?.avatar_url || ''}
                      className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-sortmy-blue focus:ring-sortmy-blue bg-sortmy-dark text-white"
                      disabled
                    />
                  </div>
                  
                  <Button variant="secondary" disabled>
                    Update Profile (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
                <CardHeader>
                  <CardTitle>Portfolio Stats</CardTitle>
                  <CardDescription>Your portfolio performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-sortmy-gray/20 border-sortmy-gray/30">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-sm text-gray-400">Total Items</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-sortmy-gray/20 border-sortmy-gray/30">
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-sm text-gray-400">Total Views</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-4">
              <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
                <CardHeader>
                  <CardTitle>Your Achievements</CardTitle>
                  <CardDescription>Track your progress and badges</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-sortmy-gray/20 border-sortmy-gray/30">
                      <CardContent className="p-4">
                        <div className="flex items-center text-2xl font-bold">
                          <Award className="w-6 h-6 mr-2 text-yellow-400" />
                          {mockBadges.filter(badge => badge.isEarned).length}
                        </div>
                        <p className="text-sm text-gray-400">Badges Earned</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-sortmy-gray/20 border-sortmy-gray/30">
                      <CardContent className="p-4">
                        <div className="flex items-center text-2xl font-bold">
                          <Zap className="w-6 h-6 mr-2 text-sortmy-blue" />
                          {enhancedUser?.xp || 0}
                        </div>
                        <p className="text-sm text-gray-400">Total XP</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <BadgeDisplay badges={mockBadges} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
