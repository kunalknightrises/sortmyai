import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import TierSection from "@/components/academy/TierSection";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import HoverEffect from "@/components/ui/HoverEffect";
import AISuggestion from "@/components/ui/AISuggestion";
import { Brain } from "lucide-react";
import { Tier, Module } from "@/types/academy";
import ModuleView from "@/pages/ModuleView";

const Academy = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [tiers] = useState<Tier[]>([
    {
      id: "tier1",
      name: "Power of Prompting",
      isUnlocked: true,
      modules: [
        {
          id: "module1",
          title: "Introduction to Prompting",
          description: "Learn the fundamentals of effective prompting in ChatGPT.",
          xpReward: 50,
          isCompleted: false,
          videoId: "jC4v5AS4RIM"
        },
        {
          id: "module2",
          title: "Clarity and Specificity",
          description: "Master techniques for writing clear and specific prompts.",
          xpReward: 75,
          isCompleted: false,
          videoId: "K3z9IAg1RkY"
        },
        {
          id: "module3",
          title: "Contextual Prompting",
          description: "Provide better context to get more accurate responses.",
          xpReward: 100,
          isCompleted: false,
          videoId: "FQo9A0cBK6I"
        },
        {
          id: "module4",
          title: "Iterative Refinement",
          description: "Learn how to refine your prompts through iterative feedback.",
          xpReward: 125,
          isCompleted: false,
          videoId: "wBgHMuLBNm0"
        },
        {
          id: "module5",
          title: "Role-based Prompting",
          description: "Use role assignments to enhance AI responses.",
          xpReward: 150,
          isCompleted: false,
          videoId: "W8cLZMeISVY",
          resourceUrl: "#" // Placeholder for resource URL
        },
      ]
    },
    {
      id: "tier2",
      name: "Advanced AI Techniques",
      isUnlocked: false,
      modules: [
        {
          id: "module6",
          title: "Chain of Thought Prompting",
          description: "Guide AI through complex reasoning processes.",
          xpReward: 200,
          isCompleted: false,
          videoId: "iOWGwb3AP0I"
        },
        {
          id: "module7",
          title: "Multi-stage AI Systems",
          description: "Build sophisticated multi-step AI workflows.",
          xpReward: 225,
          isCompleted: false,
          videoId: "xBGGxC0mPVY"
        },
      ]
    },
    {
      id: "tier3",
      name: "AI Integration Mastery",
      isUnlocked: false,
      modules: [
        {
          id: "module8",
          title: "API Integration",
          description: "Integrate AI capabilities into your applications.",
          xpReward: 300,
          isCompleted: false,
          videoId: "vuksiAHXNIQ"
        },
      ]
    }
  ]);

  const handleStartModule = (moduleId: string) => {
    // Find the module in all tiers
    const module = tiers.flatMap(tier => tier.modules)
      .find(m => m.id === moduleId);
    
    if (module) {
      setSelectedModule(module);
    }
  };

  // If a module is selected, show the module view
  if (selectedModule) {
    return <ModuleView module={selectedModule} />;
  }

  // Otherwise show the academy overview
  return (
    <div className="space-y-6 p-1 md:p-4">
      <div className="flex flex-col gap-2">
        <p className="text-gray-400">
          Master AI skills and earn XP through structured learning paths
        </p>
      </div>

      <GlassCard variant="bordered" className="border-sortmy-blue/20">
        <div className="p-4">
          <div className="flex items-center mb-2">
            <Brain className="w-5 h-5 mr-2 text-sortmy-blue" />
            <h2 className="text-lg font-semibold">AI Learning Path</h2>
          </div>
          <p className="text-sm text-gray-300 mb-4">
            Complete modules to earn XP and unlock advanced content. Track your progress and build your AI skills systematically.
          </p>
          <HoverEffect effect="lift" color="blue">
            <NeonButton variant="gradient" size="sm" onClick={() => console.log('View learning path')}>
              View Learning Path
            </NeonButton>
          </HoverEffect>
        </div>
      </GlassCard>

      <AISuggestion
        suggestion="Based on your interests, you might want to check out the 'Role-based Prompting' module next."
        actionText="Start Module"
        onAction={() => handleStartModule('module5')}
      />

      <Separator className="bg-sortmy-blue/20" />

      <div className="space-y-8">
        {tiers.map((tier) => (
          <TierSection
            key={tier.id}
            tier={tier}
            onStartModule={handleStartModule}
          />
        ))}
      </div>
    </div>
  );
};

export default Academy;
