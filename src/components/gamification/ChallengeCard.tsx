
// import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Target } from "lucide-react";
import { Challenge } from "@/types/gamification";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";
// import HoverEffect from "@/components/ui/HoverEffect";
import ClickEffect from "@/components/ui/ClickEffect";

interface ChallengeCardProps {
  challenge: Challenge;
  onStart?: () => void;
  className?: string;
}

const ChallengeCard = ({ challenge, onStart, className }: ChallengeCardProps) => {
  const progressPercentage = Math.round((challenge.progress / challenge.totalSteps) * 100);

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'medium':
        return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'hard':
        return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'boss':
        return 'text-red-400 border-red-400/30 bg-red-400/10';
      default:
        return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  return (
    <div className="h-full">
      <GlassCard variant="bordered" className={`border-sortmy-blue/20 ${className} hover:translate-y-[-5px] hover:shadow-lg transition-all duration-300`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">{challenge.name}</CardTitle>
            <CardDescription>{challenge.description}</CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`uppercase text-xs ${getDifficultyColor(challenge.difficulty)}`}
          >
            {challenge.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-1 text-sortmy-blue" />
            <span>{challenge.xpReward} XP</span>
          </div>
          {challenge.badgeReward && (
            <div className="flex items-center">
              <Trophy className="w-4 h-4 mr-1 text-yellow-400" />
              <span>Badge Reward</span>
            </div>
          )}
        </div>

        {challenge.progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-sortmy-gray/30" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {challenge.isCompleted ? (
          <NeonButton variant="cyan" className="w-full" disabled>
            <Trophy className="w-4 h-4 mr-2" />
            Completed
          </NeonButton>
        ) : (
          <ClickEffect effect="ripple" color="blue">
            <NeonButton
              className="w-full"
              variant={challenge.progress > 0 ? "gradient" : "magenta"}
              onClick={onStart}
            >
              <Target className="w-4 h-4 mr-2" />
              {challenge.progress > 0 ? "Continue" : "Start Challenge"}
            </NeonButton>
          </ClickEffect>
        )}
      </CardFooter>
      </GlassCard>
    </div>
  );
};

export default ChallengeCard;
