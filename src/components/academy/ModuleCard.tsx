
import { Module } from '@/types/academy';
import { PlayCircle, CheckCircle, FileText, Zap } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  module: Module;
  onStartModule: (moduleId: string) => void;
}

const ModuleCard = ({ module, onStartModule }: ModuleCardProps) => {
  return (
    <Card className="bg-sortmy-darker/70 border-sortmy-blue/20 hover:border-sortmy-blue/40 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">{module.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <Zap className="h-4 w-4 text-sortmy-blue mr-1" />
          <span className="text-sm text-sortmy-blue">+{module.xpReward} XP</span>
        </div>

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
        <Button
          onClick={() => onStartModule(module.id)}
          className={cn(
            "w-full gap-2",
            module.isCompleted ? "bg-green-600/20 text-green-400 hover:bg-green-600/30" : "bg-sortmy-blue hover:bg-sortmy-blue/90"
          )}
        >
          {module.isCompleted ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Completed
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Start Module
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ModuleCard;
