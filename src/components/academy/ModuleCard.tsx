
import { PlayCircle, Zap, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import YoutubeShortEmbed from "@/components/academy/YoutubeShortEmbed";
import { Module } from "@/types/academy";

interface ModuleCardProps {
  module: Module;
  onStartModule: (moduleId: string) => void;
}

const ModuleCard = ({ module, onStartModule }: ModuleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      <Card className="border-sortmy-gray/30 bg-sortmy-gray/10 h-full card-glow">
        {module.videoId && (
          <div className="px-6 pt-6 pb-0">
            <YoutubeShortEmbed videoId={module.videoId} title={module.title} />
          </div>
        )}
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{module.title}</CardTitle>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <Zap className="h-4 w-4 text-sortmy-blue mr-1" />
            <span className="text-sm text-sortmy-blue">+{module.xpReward} XP</span>
          </div>
          
          {module.resourceUrl && (
            <a 
              href={module.resourceUrl}
              className="inline-flex items-center text-xs text-sortmy-blue hover:underline"
            >
              <FileText className="h-3 w-3 mr-1" />
              Download Prompt Template
            </a>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full gap-2"
            onClick={() => onStartModule(module.id)}
            variant={module.isCompleted ? "secondary" : "default"}
          >
            {module.isCompleted ? (
              <>Completed</>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Start
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ModuleCard;
