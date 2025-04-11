
import { useState } from "react";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Award, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/types/gamification";

interface BadgeDisplayProps {
  badges: Badge[];
  showAll?: boolean;
  maxDisplay?: number;
  className?: string;
}

const BadgeDisplay = ({ 
  badges, 
  showAll = false,
  maxDisplay = 3,
  className 
}: BadgeDisplayProps) => {
  const [viewAll, setViewAll] = useState(showAll);
  
  if (!badges || badges.length === 0) {
    return (
      <div className={`bg-gray-800/10 border border-gray-700/30 rounded-lg p-4 text-center ${className}`}>
        <Award className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-400">No badges earned yet</p>
        <p className="text-xs text-gray-500 mt-1">Complete challenges to earn badges</p>
      </div>
    );
  }
  
  const earnedBadges = badges.filter(badge => badge.isEarned);
  const displayBadges = viewAll ? earnedBadges : earnedBadges.slice(0, maxDisplay);
  const remainingCount = earnedBadges.length - maxDisplay;
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium flex items-center">
          <Award className="w-4 h-4 mr-1 text-blue-500" />
          Badges Earned ({earnedBadges.length})
        </h4>
        {earnedBadges.length > maxDisplay && !viewAll && (
          <button 
            onClick={() => setViewAll(true)}
            className="text-xs text-blue-500 hover:underline flex items-center"
          >
            View all <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {displayBadges.map((badge) => (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    ${getBadgeTierClass(badge.tier)}
                  `}
                >
                  {badge.imageUrl ? (
                    <img src={badge.imageUrl} alt={badge.name} className="w-8 h-8" />
                  ) : (
                    <span className="text-lg">{getBadgeEmoji(badge.category)}</span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{badge.name}</p>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                  <UIBadge variant="outline" className="mt-1">
                    {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}
                  </UIBadge>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {!viewAll && remainingCount > 0 && (
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-700/20 cursor-pointer"
            onClick={() => setViewAll(true)}
          >
            <span className="text-xs font-medium">+{remainingCount}</span>
          </div>
        )}
      </div>
      
      {viewAll && (
        <button 
          onClick={() => setViewAll(false)}
          className="text-xs text-blue-500 hover:underline mt-2 flex items-center"
        >
          Show less
        </button>
      )}
    </div>
  );
};

// Helper function to get badge tier styling
const getBadgeTierClass = (tier: Badge['tier']) => {
  switch (tier) {
    case 'bronze':
      return 'bg-amber-700/20 border border-amber-700/30';
    case 'silver':
      return 'bg-gray-300/20 border border-gray-300/30';
    case 'gold':
      return 'bg-yellow-400/20 border border-yellow-400/30';
    case 'platinum':
      return 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-purple-500/30';
    default:
      return 'bg-gray-700/20 border border-gray-700/30';
  }
};

// Helper function to get emoji based on badge category
const getBadgeEmoji = (category: Badge['category']) => {
  switch (category) {
    case 'achievement':
      return '🏆';
    case 'milestone':
      return '🌟';
    case 'skill':
      return '⚡';
    case 'special':
      return '🎯';
    default:
      return '🏅';
  }
};

export default BadgeDisplay;
