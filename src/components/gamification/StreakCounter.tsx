
import { Flame } from "lucide-react";
import { User } from "@/types";

interface StreakCounterProps {
  user: User | null;
  className?: string;
}

const StreakCounter = ({ user, className }: StreakCounterProps) => {
  if (!user || !user.streak_days) return null;
  
  const streakDays = user.streak_days;
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full mr-2 ${streakDays >= 7 ? 'animate-pulse' : ''}`}>
        <Flame className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium">{streakDays} Day Streak</p>
        <p className="text-xs text-gray-400">
          {streakDays < 3 && "Keep going!"}
          {streakDays >= 3 && streakDays < 7 && "You're on fire!"}
          {streakDays >= 7 && "Unstoppable!"}
        </p>
      </div>
    </div>
  );
};

export default StreakCounter;
