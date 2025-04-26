
import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import YoutubeShortEmbed from './YoutubeShortEmbed';

interface ModuleCardProps {
  id: string;
  title: string;
  description: string;
  videoId?: string;
  xpReward: number;
  isLocked: boolean;
  onStart: (moduleId: string) => void;
  resourceLink?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  id,
  title,
  description,
  videoId,
  xpReward,
  isLocked,
  onStart,
  resourceLink
}) => {
  return (
    <div className="bg-sortmy-gray/20 border border-sortmy-gray/50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
      {videoId && (
        <div className="relative aspect-[9/16] max-h-48 overflow-hidden">
          <YoutubeShortEmbed videoId={videoId} />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <span className="bg-sortmy-blue/20 text-sortmy-blue text-xs px-2 py-1 rounded">+{xpReward} XP</span>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button 
            onClick={() => onStart(id)} 
            disabled={isLocked}
            size="sm"
            className={isLocked ? "opacity-50" : ""}
          >
            <Play className="mr-1 h-4 w-4" />
            {isLocked ? "Locked" : "Start"}
          </Button>
          
          {resourceLink && (
            <a 
              href={resourceLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-sortmy-blue hover:underline"
            >
              Download Prompt Template
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
