
import { Book, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import NeuCard from "@/components/ui/NeuCard";
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
        <h2 className="text-xl font-semibold bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">{tier.name}</h2>
        {!tier.isUnlocked && (
          <Badge variant="outline" className="ml-2 bg-sortmy-gray/20 text-gray-400 border-sortmy-blue/20">
            <Lock className="h-3 w-3 mr-1" /> Locked
          </Badge>
        )}
      </div>

      {tier.isUnlocked ? (
        <Accordion type="single" collapsible defaultValue={tier.id} className="w-full">
          <AccordionItem value={tier.id} className="border-sortmy-blue/20">
            <AccordionTrigger className="text-lg font-medium py-2 hover:text-sortmy-blue transition-colors">
              <span className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-sortmy-blue" />
                Modules
              </span>
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
        <NeuCard variant="flat" color="dark" className="border-sortmy-blue/10">
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-sortmy-gray/20 flex items-center justify-center mx-auto mb-3">
              <Lock className="h-6 w-6 text-gray-500" />
            </div>
            <p className="text-gray-400">Complete previous tiers to unlock this content</p>
          </div>
        </NeuCard>
      )}
    </div>
  );
};

export default TierSection;
