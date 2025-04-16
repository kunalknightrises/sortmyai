
import { useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import NeuCard from "@/components/ui/NeuCard";
import NeonButton from "@/components/ui/NeonButton";
import ClickEffect from "@/components/ui/ClickEffect";
import { Settings2, Moon, Bell, Smartphone, Save } from "lucide-react";
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text flex items-center">
          <Settings2 className="w-8 h-8 mr-2 text-sortmy-blue" />
          Settings
        </h1>
        <p className="text-gray-400 mt-1">Manage your app preferences and account settings</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard variant="bordered" className="border-sortmy-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Moon className="w-5 h-5 mr-2 text-sortmy-blue" />
              Appearance
            </CardTitle>
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
        </GlassCard>

        <NeuCard variant="flat" color="dark" className="border-sortmy-blue/10">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-sortmy-blue" />
              Notifications
            </CardTitle>
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
        </NeuCard>

        {isNative && (
          <GlassCard variant="glowing" intensity="low" className="border-sortmy-blue/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-sortmy-blue" />
                Mobile Settings
              </CardTitle>
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
          </GlassCard>
        )}
      </div>

      <ClickEffect effect="ripple" color="blue">
        <NeonButton variant="gradient" onClick={handleSaveSettings} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </NeonButton>
      </ClickEffect>
    </div>
  );
};

export default Settings;
