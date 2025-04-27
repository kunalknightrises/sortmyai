
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Zap, BookOpen, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import GlassCard from "@/components/ui/GlassCard";
import { Module } from "@/types/academy";
import XPProgress from "@/components/gamification/XPProgress";
import YoutubeShortEmbed from "@/components/academy/YoutubeShortEmbed";
import MissionChallenge from "@/components/academy/MissionChallenge";
import { useToast } from "@/hooks/use-toast";
import ModuleSidebar from "@/components/academy/ModuleSidebar";

interface ModuleViewProps {
  module: Module;
}

const ModuleView = ({ module }: ModuleViewProps) => {
  const [videoProgress, setVideoProgress] = useState(0);
  const { toast } = useToast();

  const handleChallengeComplete = () => {
    toast({
      title: "Challenge Completed! 🎉",
      description: `You've earned +${module.xpReward} XP!`,
    });
  };

  return (
    <div className="flex gap-6 p-4 min-h-screen">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Mission Briefing */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{module.title}</h1>
                <p className="text-gray-400">{module.description}</p>
              </div>
              <div className="flex items-center bg-sortmy-blue/10 px-3 py-1.5 rounded-full">
                <Zap className="w-4 h-4 text-sortmy-blue mr-1.5" />
                <span className="text-sm font-medium text-sortmy-blue">+{module.xpReward} XP</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Module Progress</span>
                <span className="text-gray-400">{videoProgress}%</span>
              </div>
              <Progress value={videoProgress} className="h-2" />
            </div>
          </div>
        </GlassCard>

        {/* Content Tabs */}
        <Tabs defaultValue="learn" className="space-y-4">
          <TabsList className="bg-sortmy-darker/50">
            <TabsTrigger value="learn" className="data-[state=active]:bg-sortmy-blue/10">
              <BookOpen className="w-4 h-4 mr-2" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-sortmy-blue/10">
              <FileText className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learn" className="space-y-4">
            <GlassCard className="aspect-video">
              <YoutubeShortEmbed
                videoId={module.videoId || ""}
                title={module.title}
                onProgressChange={setVideoProgress}
              />
            </GlassCard>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Module Resources</h3>
              <div className="prose prose-invert max-w-none">
                <p>Key takeaways and resources will be displayed here...</p>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* Mission Challenge */}
        <MissionChallenge
          moduleId={module.id}
          onComplete={handleChallengeComplete}
        />
      </div>

      {/* Sidebar */}
      <ModuleSidebar />
    </div>
  );
};

export default ModuleView;
