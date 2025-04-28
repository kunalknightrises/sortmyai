
import { useState } from 'react';
import { Zap, Copy, Check, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import GlassCard from "@/components/ui/GlassCard";
import { Module } from "@/types/academy";
import YoutubeShortEmbed from "@/components/academy/YoutubeShortEmbed";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface ModuleViewProps {
  module: Module;
  onBack?: () => void;
}

interface AITool {
  name: string;
  icon: string;
  url: string;
}

const ModuleView = ({ module, onBack }: ModuleViewProps) => {
  const navigate = useNavigate();
  const [videoProgress, setVideoProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const [currentPrompt, setCurrentPrompt] = useState(
    "I want to create a video explaining [TOPIC] using AI voice generation."
  );
  
  const aiTools: AITool[] = [
    { name: "ChatGPT", icon: "⚡", url: "https://chat.openai.com" },
    { name: "HeyGen", icon: "🎬", url: "https://www.heygen.com" },
    { name: "Midjourney", icon: "🖼️", url: "https://www.midjourney.com" },
    { name: "ElevenLabs", icon: "🔊", url: "https://elevenlabs.io" }
  ];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopied(true);
    
    toast({
      title: "Prompt Copied",
      description: "The prompt has been copied to your clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleToolClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard/academy');
    }
  };

  return (
    <div className="flex gap-6 p-4 min-h-screen">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Navigation and Mission Briefing */}
        <GlassCard className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Academy
                </Button>
              </div>
              <div className="flex items-center bg-sortmy-blue/10 px-3 py-1.5 rounded-full">
                <Zap className="w-4 h-4 text-sortmy-blue mr-1.5" />
                <span className="text-sm font-medium text-sortmy-blue">+{module.xpReward} XP</span>
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{module.title}</h1>
              <p className="text-gray-400">{module.description}</p>
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

        {/* Main Layout: Side by Side Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel - YouTube Short */}
          <GlassCard className="flex-1 overflow-hidden flex flex-col h-[calc(100vh-24rem)]">
            <div className="bg-sortmy-blue/10 p-3 flex items-center">
              <h3 className="text-md font-semibold text-white">Learn</h3>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="w-full max-w-[315px] mx-auto h-[560px]"> {/* Standard YouTube Shorts dimensions */}
                <YoutubeShortEmbed
                  videoId={module.videoId || ""}
                  title={module.title}
                  onProgressChange={setVideoProgress}
                />
              </div>
            </div>
          </GlassCard>

          {/* Right Panel - Resources & Tools */}
          <div className="flex flex-col gap-6">
            {/* Resources Section (Top) */}
            <GlassCard className="flex-1 overflow-hidden flex flex-col h-[calc(100vh-24rem)]">
              <div className="bg-sortmy-blue/10 p-3 flex items-center">
                <h3 className="text-md font-semibold text-white">Resources</h3>
              </div>
              <div className="flex-1 p-4 space-y-5 overflow-auto">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300">
                    In this lesson, we'll learn how to create AI-powered videos with customized voices.
                    Follow along with the tutorial and use the prompt below.
                  </p>
                </div>
                
                <div className="space-y-2 bg-sortmy-darker/50 p-4 rounded-lg border border-sortmy-blue/20">
                  <label className="text-sm font-medium text-gray-300">Editable Prompt Template</label>
                  <Input
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    className="bg-sortmy-darker border-sortmy-blue/20 text-white"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCopyPrompt}
                      variant="outline"
                      size="sm"
                      className="border-sortmy-blue/30 text-sortmy-blue hover:bg-sortmy-blue/10"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-sortmy-blue/10 pt-3 mt-3">
                  <h4 className="text-sm font-medium mb-4 text-gray-300">AI Tools</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {aiTools.map((tool, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleToolClick(tool.url)}
                        className="flex flex-col items-center p-3 h-auto bg-sortmy-darker/50 
                                hover:bg-sortmy-blue/10 border border-sortmy-blue/20 
                                hover:border-sortmy-blue/40 transition-all duration-300"
                      >
                        <span className="text-2xl mb-1">{tool.icon}</span>
                        <span className="text-xs text-gray-300">{tool.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
