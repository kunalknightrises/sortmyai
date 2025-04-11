
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy } from "lucide-react";
import { Challenge } from "@/types/gamification";

interface ChallengeCardProps {
  challenge: Challenge;
  onStart?: () => void;
  className?: string;
}

export const ChallengeCard = ({ challenge, onStart, className }: ChallengeCardProps) => {
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
    <Card className={`border-gray-800/20 bg-gray-900/10 hover:bg-gray-900/20 transition-colors ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{challenge.name}</CardTitle>
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
            <Zap className="w-4 h-4 mr-1 text-blue-500" />
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
            <Progress value={progressPercentage} className="h-2 bg-gray-700/30" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {challenge.isCompleted ? (
          <Button className="w-full" disabled>
            Completed
          </Button>
        ) : (
          <Button 
            className="w-full" 
            variant={challenge.progress > 0 ? "default" : "outline"}
            onClick={onStart}
          >
            {challenge.progress > 0 ? "Continue" : "Start Challenge"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChallengeCard;
