
import { useState } from 'react';
import type { AuthUser } from '@/contexts/AuthContext';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Crown, Flame, LightningBolt } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import XPProgress from '@/components/gamification/XPProgress';
import StreakCounter from '@/components/gamification/StreakCounter';
import BadgeDisplay from '@/components/gamification/BadgeDisplay';
import { Badge as BadgeType } from '@/types/gamification';

interface UserProfileUpdate extends Partial<AuthUser> {}

const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }).optional(),
});

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
    name: 'Getting Started',
    description: 'Completed your first challenge',
    icon: 'star',
    category: 'milestone',
    tier: 'bronze',
    isEarned: true,
    earnedDate: new Date().toISOString()
  }
];

const Profile = () => {
  const { user, updateUserData } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Enhance user with mock gamification data if not present
  const enhancedUser = user ? {
    ...user,
    xp: user.xp || 250,
    level: user.level || 3,
    streak_days: user.streak_days || 5,
    last_login: user.last_login || new Date().toISOString(),
    badges: user.badges || ['badge1', 'badge2', 'badge3']
  } : null;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
    },
  });
  
  const getInitials = () => {
    if (!user || !user.username) return 'U';
    return user.username.substring(0, 2).toUpperCase();
  };
  
  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsUpdating(true);

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: values.username
        });
      }

      // Update Firestore user data
      await updateUserData({
        username: values.username,
      } as UserProfileUpdate);

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (!user) {
    return <div>Loading profile...</div>;
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="col-span-2 bg-sortmy-gray/10 border-sortmy-gray/30">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="text-2xl bg-sortmy-blue/20 text-sortmy-blue">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* XP Level Badge */}
                    <div className="absolute -top-2 -right-2 bg-sortmy-blue text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-sortmy-dark">
                      {enhancedUser?.level || 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormDescription>
                            Email cannot be changed directly. Please contact support.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* XP and Streak */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <XPProgress user={enhancedUser} />
                  </div>
                  <div className="flex items-center justify-center p-4 bg-sortmy-gray/20 rounded-lg">
                    <StreakCounter user={enhancedUser} />
                  </div>
                </div>
                
                {/* Badges */}
                <BadgeDisplay badges={mockBadges} showAll={true} />
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    asChild
                  >
                    <a href="/dashboard/achievements">
                      <Award className="w-4 h-4 mr-2" />
                      View All Achievements
                    </a>
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Account Details Card */}
        <div className="col-span-1 space-y-6">
          <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Account Status</p>
                <p>{user.is_premium ? 'Premium' : 'Free'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Joined</p>
                <p>{new Date(user.created_at || '').toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Experience</p>
                <div className="flex items-center">
                  <LightningBolt className="w-4 h-4 mr-1 text-sortmy-blue" />
                  <span>{enhancedUser?.xp || 0} XP (Level {enhancedUser?.level || 1})</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Current Streak</p>
                <div className="flex items-center">
                  <Flame className="w-4 h-4 mr-1 text-orange-400" />
                  <span>{enhancedUser?.streak_days || 0} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Premium Status Card */}
          {user.is_premium ? (
            <Card className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span>SortMyAI+</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Premium Features</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Claude 3.5 Sonnet</label>
                        <p className="text-xs text-gray-400">Enable advanced AI capabilities</p>
                      </div>
                      <Switch 
                        checked={user.claude_enabled}
                        onCheckedChange={async (checked) => {
                          try {
                            const userRef = doc(db, 'users', user.uid);
                            await updateDoc(userRef, { claude_enabled: checked });
                            
                            toast({
                              title: "Settings updated",
                              description: `Claude 3.5 Sonnet has been ${checked ? 'enabled' : 'disabled'}.`,
                            });
                          } catch (error: any) {
                            console.error('Error updating Claude settings:', error);
                            toast({
                              title: "Error",
                              description: "Failed to update settings. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-sm font-medium">Advanced Analytics</label>
                        <p className="text-xs text-gray-400">Track usage and insights</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
              <CardHeader>
                <CardTitle>Upgrade to Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Get access to advanced features, AI assistant, analytics, and more.
                </p>
                <Button className="w-full">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
