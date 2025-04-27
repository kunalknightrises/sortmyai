
import { Tier } from "@/types/academy";
import { Lock } from "lucide-react";
import ModuleCard from "./ModuleCard";

interface TierSectionProps {
  tier: Tier;
  onStartModule: (moduleId: string) => void;
}

const TierSection = ({ tier, onStartModule }: TierSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{tier.name}</h2>
        {!tier.isUnlocked && (
          <div className="flex items-center gap-2 bg-sortmy-blue/10 px-3 py-1.5 rounded-full">
            <Lock className="w-4 h-4 text-sortmy-blue" />
            <span className="text-xs text-sortmy-blue">Locked</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tier.modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onStartModule={onStartModule}
          />
        ))}
      </div>
    </div>
  );
};

export default TierSection;
