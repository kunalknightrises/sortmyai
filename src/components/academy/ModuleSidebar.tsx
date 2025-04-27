
import { User } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import XPProgress from "@/components/gamification/XPProgress";
import AIKnowledgeMeter from "@/components/gamification/AIKnowledgeMeter";

// Mock user data for demonstration purposes
// In a real application, this would come from a context or prop
const mockUser = {
  xp: 150,
  level: 2,
  streak_days: 3,
  ai_knowledge: {
    overall: 42,
    categories: {
      'prompting': 65,
      'tools': 35,
      'techniques': 25
    }
  }
};

const ModuleSidebar = () => {
  return (
    <div className="w-80 space-y-4 flex-shrink-0">
      <GlassCard className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-sortmy-blue/10 p-2 rounded-full">
            <User className="w-5 h-5 text-sortmy-blue" />
          </div>
          <div>
            <p className="text-sm font-medium">Academy Rank</p>
            <p className="text-xs text-gray-400">Explorer Level 2</p>
          </div>
        </div>

        <XPProgress variant="compact" user={mockUser} />
        <AIKnowledgeMeter user={mockUser} />
      </GlassCard>
    </div>
  );
};

export default ModuleSidebar;
