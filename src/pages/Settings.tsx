
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { isNativePlatform } from '@/lib/capacitor';

const Settings = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [saveChanges, setSaveChanges] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const isNative = isNativePlatform();

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your app preferences and account settings</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the app looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <Switch 
                id="dark-mode" 
                checked={darkMode} 
                onCheckedChange={setDarkMode} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="save-changes">Auto-save Changes</Label>
              <Switch 
                id="save-changes" 
                checked={saveChanges} 
                onCheckedChange={setSaveChanges} 
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control when and how you get notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch 
                id="notifications" 
                checked={notifications} 
                onCheckedChange={setNotifications} 
              />
            </div>
          </CardContent>
        </Card>
        
        {isNative && (
          <Card>
            <CardHeader>
              <CardTitle>Mobile Settings</CardTitle>
              <CardDescription>Configure mobile-specific settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="offline-mode">Offline Mode</Label>
                <Switch 
                  id="offline-mode" 
                  checked={offlineMode} 
                  onCheckedChange={setOfflineMode} 
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
        Save Settings
      </Button>
    </div>
  );
};

export default Settings;
