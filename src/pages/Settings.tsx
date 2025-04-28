
import { useState } from 'react';
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import NeonButton from "@/components/ui/NeonButton";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  UserCircle2,
  Lock,
  GraduationCap,
  Trash2,
  Code
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
    icon: <Code className="w-4 h-4" />,
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
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Simple button list instead of tabs */}
        <div className="w-52 lg:w-56 flex-shrink-0">
          <div className="flex flex-col space-y-1.5">
            {settingsCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-left text-sm ${
                  activeTab === category.id
                    ? 'bg-sortmy-blue/10 text-sortmy-blue border-l-2 border-sortmy-blue'
                    : 'text-gray-400 hover:text-white hover:bg-sortmy-blue/5'
                }`}
              >
                <span className="flex-shrink-0">{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-sortmy-darker/70 backdrop-blur-md rounded-lg border border-sortmy-blue/20 p-6">
            <div>
              {activeTab === 'general' && (
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
              )}

              {activeTab === 'security' && (
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
              )}

              {activeTab === 'intern' && (
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
                        <input
                          type="checkbox"
                          id="intern-badge"
                          checked={formData.showInternBadge}
                          onChange={(e) => handleInputChange('showInternBadge', e.target.checked)}
                          className="toggle"
                        />
                        <Label htmlFor="intern-badge">Show Badge</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}

              {activeTab === 'danger' && (
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
              )}

              {activeTab === 'connected' && (
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Connected Accounts</h3>
                      <p className="text-sm text-gray-400">
                        Manage your connected accounts and services
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border border-sortmy-blue/20 rounded-md">
                        <div className="flex items-center">
                          <Code className="w-5 h-5 mr-3 text-white" />
                          <div>
                            <p className="text-sm font-medium">GitHub</p>
                            <p className="text-xs text-gray-400">Not connected</p>
                          </div>
                        </div>
                        <NeonButton variant="outline" size="sm">Connect</NeonButton>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}

              {activeTab === 'academy' && (
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Academy Progress</h3>
                      <p className="text-sm text-gray-400">
                        Track your learning progress and achievements
                      </p>
                    </div>
                    <div className="bg-sortmy-darker rounded-md p-4 border border-sortmy-blue/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Current Tier:</span>
                        <span className="text-sm font-medium text-sortmy-blue">Explorer</span>
                      </div>
                      <div className="w-full bg-sortmy-gray/20 rounded-full h-2.5">
                        <div className="bg-sortmy-blue h-2.5 rounded-full" style={{ width: "45%" }}></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">9/20 modules completed</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </div>

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
