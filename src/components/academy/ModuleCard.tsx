
import { PlayCircle, Zap, FileText, CheckCircle } from "lucide-react";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
import ClickEffect from "@/components/ui/ClickEffect";
import AnimatedTooltip from "@/components/ui/AnimatedTooltip";
import { motion } from "framer-motion";
import YoutubeShortEmbed from "@/components/academy/YoutubeShortEmbed";
import { Module } from "@/types/academy";

interface ModuleCardProps {
  module: Module;
  onStartModule: (tierId: string, moduleId: string) => void;
  tierId: string;
}

const ModuleCard = ({ module, onStartModule, tierId }: ModuleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      <GlassCard variant="bordered" className="border-sortmy-blue/20 h-full">
        {module.videoId && (
          <div className="px-6 pt-6 pb-0">
            <YoutubeShortEmbed videoId={module.videoId} title={module.title} />
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">{module.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatedTooltip content="Complete this module to earn XP" position="top">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-sortmy-blue mr-1" />
              <span className="text-sm text-sortmy-blue">+{module.xpReward} XP</span>
            </div>
          </AnimatedTooltip>

          {module.resourceUrl && (
            <a
              href={module.resourceUrl}
              className="inline-flex items-center text-xs text-sortmy-blue hover:text-sortmy-blue/80 transition-colors p-1 rounded-md hover:bg-sortmy-blue/5"
            >
              <FileText className="h-3 w-3 mr-1" />
              Download Prompt Template
            </a>
          )}
        </CardContent>
        <CardFooter>
          <ClickEffect effect="ripple" color="blue">
            <NeonButton
              variant={module.isCompleted ? "cyan" : "gradient"}
              className="w-full gap-2"
              onClick={() => onStartModule(tierId, module.id)}
            >
              {module.isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Start Module
                </>
              )}
            </NeonButton>
          </ClickEffect>
        </CardFooter>
      </GlassCard>
    </motion.div>
  );
};

export default ModuleCard;
