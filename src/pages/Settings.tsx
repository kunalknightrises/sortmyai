
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import NeonButton from "@/components/ui/NeonButton";
import { useToast } from "@/hooks/use-toast";
import {
  Settings2, 
  Shield, 
  UserCircle2, 
  Lock,
  GraduationCap,
  Trash2,
  Github
} from "lucide-react";

// Create categories for our settings
const settingsCategories = [
  {
    id: 'general',
    label: 'General',
    icon: <UserCircle2 className="w-4 h-4" />,
  },
  {
    id: 'connected',
    label: 'Connected Accounts',
    icon: <Github className="w-4 h-4" />,
  },
  {
    id: 'security',
    label: 'Security & Privacy',
    icon: <Shield className="w-4 h-4" />,
  },
  {
    id: 'intern',
    label: 'Intern Profile',
    icon: <Lock className="w-4 h-4" />,
  },
  {
    id: 'academy',
    label: 'Academy Progress',
    icon: <GraduationCap className="w-4 h-4" />,
  },
  {
    id: 'danger',
    label: 'Danger Zone',
    icon: <Trash2 className="w-4 h-4" />,
  }
];

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: 'John Doe',
    bio: 'AI enthusiast and developer',
    username: 'johndoe',
    email: 'john@example.com',
    phone: '+1 234 567 8900',
    showInternBadge: true,
    isPublicProfile: true
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your account settings have been updated successfully.",
    });
  };

  const handleInputChange = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text flex items-center">
          <Settings2 className="w-8 h-8 mr-2 text-sortmy-blue" />
          Account Settings
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your account preferences and profile settings
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-sortmy-darker/70 backdrop-blur-md rounded-lg border border-sortmy-blue/20 p-2">
            <TabsList className="flex flex-col w-full space-y-1">
              {settingsCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className={`justify-start px-4 py-2.5 w-full text-left ${
                    activeTab === category.id
                      ? 'bg-sortmy-blue/10 text-sortmy-blue border-l-2 border-sortmy-blue'
                      : 'text-gray-400 hover:text-white hover:bg-sortmy-blue/5'
                  }`}
                  onClick={() => setActiveTab(category.id)}
                >
                  <span className="flex items-center gap-3">
                    {category.icon}
                    {category.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-sortmy-darker/70 backdrop-blur-md rounded-lg border border-sortmy-blue/20 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="general">
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="bg-sortmy-gray/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="w-full min-h-[100px] bg-sortmy-gray/20 rounded-md border border-input px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="bg-sortmy-gray/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        readOnly
                        className="bg-sortmy-gray/20 opacity-50 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="bg-sortmy-gray/20"
                      />
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="security">
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Profile Visibility</h3>
                        <p className="text-sm text-gray-400">
                          Control who can see your profile
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="public-profile">Public</Label>
                        <input
                          type="checkbox"
                          id="public-profile"
                          checked={formData.isPublicProfile}
                          onChange={(e) => handleInputChange('isPublicProfile', e.target.checked)}
                          className="toggle"
                        />
                      </div>
                    </div>

                    <div>
                      <NeonButton variant="outline" className="w-full">
                        Change Password
                      </NeonButton>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="intern">
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Intern Badge</h3>
                        <p className="text-sm text-gray-400">
                          Show your First Wave Intern badge on your profile
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="intern-badge">Show Badge</Label>
                        <input
                          type="checkbox"
                          id="intern-badge"
                          checked={formData.showInternBadge}
                          onChange={(e) => handleInputChange('showInternBadge', e.target.checked)}
                          className="toggle"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="danger">
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-red-500">Delete Account</h3>
                      <p className="text-sm text-gray-400">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                    </div>
                    <NeonButton 
                      variant="outline" 
                      className="w-full bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </NeonButton>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <NeonButton onClick={handleSaveSettings}>
                Save Changes
              </NeonButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
