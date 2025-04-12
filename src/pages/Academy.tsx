
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import TierSection from "@/components/academy/TierSection";
import { Tier } from "@/types/academy";

const Academy = () => {
  // Academy tiers and modules
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

  const handleStartModule = (tierId: string, moduleId: string) => {
    console.log(`Starting module ${moduleId} in tier ${tierId}`);
    // In a real implementation, this would navigate to the module content
    // and handle progress tracking
  };

  return (
    <div className="space-y-6 p-1 md:p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Academy</h1>
        <p className="text-gray-400">
          Master AI skills and earn XP through structured learning paths
        </p>
      </div>

      <Separator className="bg-sortmy-gray/30" />

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
