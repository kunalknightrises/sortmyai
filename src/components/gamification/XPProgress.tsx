
import { Progress } from "@/components/ui/progress";
import { User } from "@/types";
import { LightningBolt } from "lucide-react";

interface XPProgressProps {
  user: User | null;
  className?: string;
  variant?: 'default' | 'compact';
}

const XPProgress = ({ user, className, variant = 'default' }: XPProgressProps) => {
  // No user data yet
  if (!user) return null;
  
  // Default values if not set
  const currentXP = user.xp || 0;
  const currentLevel = user.level || 1;
  
  // Calculate XP needed for next level using a simple formula
  // Each level requires more XP than the previous
  const baseXP = 100;
  const nextLevelXP = baseXP * Math.pow(1.5, currentLevel - 1);
  
  // Calculate progress percentage
  const levelProgress = Math.min(Math.floor((currentXP / nextLevelXP) * 100), 100);
  
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="bg-sortmy-blue/20 p-1 rounded-full">
          <LightningBolt className="w-3 h-3 text-sortmy-blue" />
        </div>
        <span className="text-xs font-medium">{currentXP} XP</span>
        <span className="text-xs text-gray-400">Lvl {currentLevel}</span>
      </div>
    );
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-sortmy-blue/20 p-2 rounded-full mr-2">
            <LightningBolt className="w-4 h-4 text-sortmy-blue" />
          </div>
          <div>
            <p className="text-sm font-medium">Level {currentLevel}</p>
            <p className="text-xs text-gray-400">{currentXP} XP</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">{levelProgress}% to Level {currentLevel + 1}</span>
      </div>
      <Progress
        value={levelProgress}
        className="h-2 bg-sortmy-gray/30"
      />
    </div>
  );
};

export default XPProgress;
