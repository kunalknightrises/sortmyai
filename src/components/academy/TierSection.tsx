
import { Tier } from '@/types/academy';
import ModuleCard from './ModuleCard';

interface TierSectionProps {
  tier: Tier;
  onStartModule: (moduleId: string) => void;
}

const TierSection = ({ tier, onStartModule }: TierSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{tier.name}</h3>
        {!tier.isUnlocked && (
          <span className="text-sm text-gray-400">
            Locked
          </span>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tier.modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            tierId={tier.id}
            onStartModule={onStartModule}
          />
        ))}
      </div>
    </div>
  );
};

export default TierSection;
