import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface EnhancedStreakCounterProps {
  streakDays: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const EnhancedStreakCounter: React.FC<EnhancedStreakCounterProps> = ({
  streakDays,
  className,
  size = 'md',
  animate = true,
}) => {
  const [isFlameAnimating, setIsFlameAnimating] = useState(false);
  const [displayDays, setDisplayDays] = useState(streakDays);
  const [showIncrement, setShowIncrement] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const flameSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Animate streak when it changes
  useEffect(() => {
    if (streakDays > displayDays && animate) {
      // Show the increment animation
      setShowIncrement(true);

      // Start flame animation
      setIsFlameAnimating(true);

      // Update the display value after a delay
      setTimeout(() => {
        setDisplayDays(streakDays);
      }, 300);

      // Hide the increment animation after it completes
      setTimeout(() => {
        setShowIncrement(false);
      }, 1500);

      // Stop flame animation after a while
      setTimeout(() => {
        setIsFlameAnimating(false);
      }, 3000);
    } else {
      setDisplayDays(streakDays);
    }
  }, [streakDays, displayDays, animate]);

  // Get flame color based on streak
  const getFlameColor = () => {
    if (streakDays < 3) return 'text-orange-400';
    if (streakDays < 7) return 'text-orange-500';
    if (streakDays < 14) return 'text-red-500';
    if (streakDays < 30) return 'text-pink-500';
    return 'text-[#ff00cc]';
  };

  return (
    <div className={cn(
      "flex items-center gap-1.5 font-medium",
      sizeClasses[size],
      className
    )}>
      {/* Animated Flame Icon */}
      <div className="relative">
        <Flame
          className={cn(
            flameSizes[size],
            getFlameColor(),
            isFlameAnimating ? 'animate-flame' : ''
          )}
          fill={streakDays > 0 ? 'currentColor' : 'none'}
          fillOpacity={streakDays > 0 ? (streakDays < 7 ? 0.7 : 0.9) : 0}
        />

        {/* Flame glow effect */}
        {streakDays > 0 && (
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-sm -z-10",
              isFlameAnimating ? 'animate-pulse' : ''
            )}
            style={{
              backgroundColor: streakDays < 7
                ? 'rgba(255, 153, 0, 0.3)'
                : 'rgba(255, 0, 204, 0.3)'
            }}
          />
        )}
      </div>

      {/* Streak Counter */}
      <div className="relative">
        <span>{displayDays}-day streak</span>

        {/* Increment Animation */}
        {showIncrement && (
          <span
            className="absolute -top-4 left-0 text-green-400 font-bold animate-increment"
            style={{ fontSize: '0.7em' }}
          >
            +1
          </span>
        )}
      </div>

      {/* Add keyframes for animations */}
      <style>{`
        @keyframes flame {
          0%, 100% { transform: scale(1) rotate(-2deg); }
          25% { transform: scale(1.1) rotate(2deg); }
          50% { transform: scale(0.95) rotate(-1deg); }
          75% { transform: scale(1.05) rotate(1deg); }
        }

        @keyframes increment {
          0% { opacity: 0; transform: translateY(0); }
          20% { opacity: 1; }
          80% { opacity: 1; transform: translateY(-10px); }
          100% { opacity: 0; transform: translateY(-15px); }
        }

        :global(.animate-flame) {
          animation: flame 0.5s ease-in-out infinite;
        }

        :global(.animate-increment) {
          animation: increment 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EnhancedStreakCounter;
