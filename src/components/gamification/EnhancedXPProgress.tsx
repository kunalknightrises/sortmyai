import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface EnhancedXPProgressProps {
  xp: number;
  level: number;
  xpForNextLevel: number;
  className?: string;
  showSparks?: boolean;
  showLevel?: boolean;
  animate?: boolean;
}

const EnhancedXPProgress: React.FC<EnhancedXPProgressProps> = ({
  xp,
  level,
  xpForNextLevel,
  className,
  showSparks = true,
  showLevel = true,
  animate = true,
}) => {
  const [displayXP, setDisplayXP] = useState(0);
  const [sparks, setSparks] = useState<Array<{ id: number; left: string; animationDuration: string }>>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const prevXP = useRef(xp);

  // Calculate percentage
  // const percentage = Math.min(100, Math.round((xp / xpForNextLevel) * 100));
  const displayPercentage = Math.min(100, Math.round((displayXP / xpForNextLevel) * 100));

  // Animate XP when it changes
  useEffect(() => {
    if (!animate) {
      setDisplayXP(xp);
      return;
    }

    // If XP increased, animate it
    if (xp > prevXP.current) {
      const diff = xp - prevXP.current;
      const duration = Math.min(1500, diff * 10); // Cap at 1.5 seconds

      let startTime: number;
      const startValue = prevXP.current;

      const animateXP = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smoother animation
        const easedProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

        setDisplayXP(Math.floor(startValue + diff * easedProgress));

        if (progress < 1) {
          requestAnimationFrame(animateXP);
        }
      };

      requestAnimationFrame(animateXP);

      // Create sparks when XP increases
      if (showSparks && progressRef.current) {
        const newSparks = Array.from({ length: Math.min(5, Math.ceil(diff / 10)) }, (_, i) => ({
          id: Date.now() + i,
          left: `${Math.random() * 100}%`,
          animationDuration: `${0.5 + Math.random() * 1}s`,
        }));

        setSparks(prev => [...prev, ...newSparks]);

        // Remove sparks after animation
        setTimeout(() => {
          setSparks(prev => prev.filter(spark => !newSparks.some(ns => ns.id === spark.id)));
        }, 2000);
      }
    } else {
      // If XP decreased or stayed the same, just set it
      setDisplayXP(xp);
    }

    prevXP.current = xp;
  }, [xp, animate, showSparks, xpForNextLevel]);

  return (
    <div className={cn("relative w-full", className)}>
      {/* XP Bar Background */}
      <div className="h-2 bg-[#0d001a] rounded-full overflow-hidden border border-[#2a003f]">
        {/* XP Progress */}
        <div
          ref={progressRef}
          className="h-full bg-gradient-to-r from-[#00ffff] to-[#ff00cc] rounded-full relative overflow-hidden transition-all duration-300 ease-out"
          style={{ width: `${displayPercentage}%` }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-white opacity-30 blur-sm" />

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>

      {/* Sparks */}
      {sparks.map(spark => (
        <div
          key={spark.id}
          className="absolute bottom-0 w-1 h-1 bg-white rounded-full animate-spark pointer-events-none"
          style={{
            left: spark.left,
            animation: `spark ${spark.animationDuration} ease-out forwards`,
            boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.7), 0 0 8px 2px rgba(0, 255, 255, 0.5)',
          }}
        />
      ))}

      {/* XP Text */}
      <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
        <div className="flex items-center">
          <Sparkles className="w-3 h-3 mr-1 text-[#00ffff]" />
          <span>{displayXP} / {xpForNextLevel} XP</span>
        </div>

        {showLevel && (
          <div className="px-2 py-0.5 bg-[#2a003f] rounded text-[#ff00cc] text-xs font-medium">
            Level {level}
          </div>
        )}
      </div>

      {/* Add keyframes for spark animation */}
      <style>{`
        @keyframes spark {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-20px) scale(0);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedXPProgress;
