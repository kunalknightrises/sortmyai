
import { Book, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tier } from "@/types/academy";
import ModuleCard from "./ModuleCard";

interface TierSectionProps {
  tier: Tier;
  onStartModule: (tierId: string, moduleId: string) => void;
}

const TierSection = ({ tier, onStartModule }: TierSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Book className="h-5 w-5 text-sortmy-blue" />
        <h2 className="text-xl font-semibold">{tier.name}</h2>
        {!tier.isUnlocked && (
          <Badge variant="outline" className="ml-2 bg-sortmy-gray/20 text-gray-400">
            <Lock className="h-3 w-3 mr-1" /> Locked
          </Badge>
        )}
      </div>

      {tier.isUnlocked ? (
        <Accordion type="single" collapsible defaultValue={tier.id} className="w-full">
          <AccordionItem value={tier.id} className="border-sortmy-gray/30">
            <AccordionTrigger className="text-lg font-medium py-2">
              Modules
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {tier.modules.map((module) => (
                  <ModuleCard 
                    key={module.id} 
                    module={module} 
                    tierId={tier.id}
                    onStartModule={(moduleId) => onStartModule(tier.id, moduleId)}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="p-6 text-center border border-sortmy-gray/30 rounded-lg bg-sortmy-gray/10">
          <Lock className="h-8 w-8 mx-auto mb-2 text-gray-500" />
          <p className="text-gray-400">🔒 Complete previous tiers to unlock this tier.</p>
        </div>
      )}
    </div>
  );
};

export default TierSection;
