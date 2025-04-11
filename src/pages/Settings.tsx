
import React, { useState } from 'react';
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Globe, Lock, Moon, Shield, UserCog } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  // Mock settings states
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weeklyDigest: true,
    newFeatures: true,
  });
  
  const [appearance, setAppearance] = useState({
    darkMode: true,
    compactView: false,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showActivity: true,
    allowTagging: true,
  });

  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
  });

  if (!user) {
    return <div className="p-6">Please log in to view settings.</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-400">Customize your experience</p>
      </div>
      
      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-2">
          <TabsTrigger value="account" className="text-sm">
            <UserCog className="w-4 h-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-sm">
            <Moon className="w-4 h-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-sm">
            <Lock className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="text-sm">
            <Globe className="w-4 h-4 mr-2" />
            Accessibility
          </TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Connected Accounts</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between bg-sortmy-gray/20 p-3 rounded-md">
                    <div className="flex items-center">
                      <Shield className="w-5 h-5 mr-3 text-sortmy-blue" />
                      <span>Email & Password</span>
                    </div>
                    <span className="text-sm text-gray-400">{user.email}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Account Security</h3>
                <Button variant="outline" className="w-full mb-2">Change Password</Button>
                <Button variant="outline" className="w-full">Enable Two-Factor Authentication</Button>
              </div>
              
              <div className="border-t border-sortmy-gray/30 pt-4">
                <h3 className="font-medium text-red-500 mb-2">Danger Zone</h3>
                <Button variant="destructive" className="w-full">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how SortMyAI looks for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                  <p className="text-sm text-gray-400">Use darker color scheme</p>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={appearance.darkMode}
                  onCheckedChange={(checked) => setAppearance({...appearance, darkMode: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-view" className="font-medium">Compact View</Label>
                  <p className="text-sm text-gray-400">Reduce spacing between items</p>
                </div>
                <Switch 
                  id="compact-view" 
                  checked={appearance.compactView}
                  onCheckedChange={(checked) => setAppearance({...appearance, compactView: checked})}
                />
              </div>
              
              <Button variant="secondary" className="w-full mt-4">Save Appearance Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifs" className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-gray-400">Receive updates via email</p>
                </div>
                <Switch 
                  id="email-notifs" 
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifs" className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-gray-400">Receive notifications in-browser</p>
                </div>
                <Switch 
                  id="push-notifs" 
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-digest" className="font-medium">Weekly Digest</Label>
                  <p className="text-sm text-gray-400">Receive a weekly summary of activity</p>
                </div>
                <Switch 
                  id="weekly-digest" 
                  checked={notifications.weeklyDigest}
                  onCheckedChange={(checked) => setNotifications({...notifications, weeklyDigest: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-features" className="font-medium">New Features</Label>
                  <p className="text-sm text-gray-400">Get notified about new SortMyAI features</p>
                </div>
                <Switch 
                  id="new-features" 
                  checked={notifications.newFeatures}
                  onCheckedChange={(checked) => setNotifications({...notifications, newFeatures: checked})}
                />
              </div>
              
              <Button variant="secondary" className="w-full mt-4">Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profile-visibility" className="font-medium">Profile Visibility</Label>
                <select 
                  id="profile-visibility" 
                  className="w-full mt-1 p-2 rounded-md bg-sortmy-gray/20 border border-sortmy-gray/30 text-white"
                  value={privacy.profileVisibility}
                  onChange={(e) => setPrivacy({...privacy, profileVisibility: e.target.value})}
                >
                  <option value="public">Public - Everyone can see your profile</option>
                  <option value="followers">Followers Only</option>
                  <option value="private">Private - Only you</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div>
                  <Label htmlFor="show-activity" className="font-medium">Activity Status</Label>
                  <p className="text-sm text-gray-400">Show when you're active on the platform</p>
                </div>
                <Switch 
                  id="show-activity" 
                  checked={privacy.showActivity}
                  onCheckedChange={(checked) => setPrivacy({...privacy, showActivity: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-tagging" className="font-medium">Allow Tagging</Label>
                  <p className="text-sm text-gray-400">Allow others to tag you in posts and comments</p>
                </div>
                <Switch 
                  id="allow-tagging" 
                  checked={privacy.allowTagging}
                  onCheckedChange={(checked) => setPrivacy({...privacy, allowTagging: checked})}
                />
              </div>
              
              <Button variant="secondary" className="w-full mt-4">Save Privacy Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Accessibility Settings */}
        <TabsContent value="accessibility" className="space-y-4">
          <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>Make SortMyAI work better for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast" className="font-medium">High Contrast</Label>
                  <p className="text-sm text-gray-400">Increase contrast for better visibility</p>
                </div>
                <Switch 
                  id="high-contrast" 
                  checked={accessibility.highContrast}
                  onCheckedChange={(checked) => setAccessibility({...accessibility, highContrast: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="large-text" className="font-medium">Larger Text</Label>
                  <p className="text-sm text-gray-400">Increase text size throughout the application</p>
                </div>
                <Switch 
                  id="large-text" 
                  checked={accessibility.largeText}
                  onCheckedChange={(checked) => setAccessibility({...accessibility, largeText: checked})}
                />
              </div>
              
              <Button variant="secondary" className="w-full mt-4">Save Accessibility Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
