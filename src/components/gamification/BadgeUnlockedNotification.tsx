import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Award, X } from 'lucide-react';
import { Badge as BadgeType } from '@/types/gamification';

interface BadgeUnlockedNotificationProps {
  badge: BadgeType;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const BadgeUnlockedNotification: React.FC<BadgeUnlockedNotificationProps> = ({
  badge,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto close after delay
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 500); // Match transition duration
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-500 transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0",
        isClosing && "translate-y-10 opacity-0"
      )}
    >
      <div className="relative overflow-hidden rounded-lg bg-[#0d001a] border border-[#ff00cc]/30 shadow-lg shadow-[#ff00cc]/20">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff00cc]/10 to-[#00ffff]/10 animate-pulse" />

        {/* Badge content */}
        <div className="relative p-4">
          <div className="flex items-start">
            {/* Badge icon */}
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff00cc] to-[#00ffff] flex items-center justify-center shadow-inner">
                {badge.icon ? (
                  <img src={badge.icon} alt={badge.name} className="w-8 h-8" />
                ) : (
                  <Award className="w-6 h-6 text-white" />
                )}
              </div>
            </div>

            {/* Badge info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1 flex items-center">
                <span className="mr-2">Badge Unlocked!</span>
                <span className="text-xs px-2 py-0.5 bg-[#ff00cc]/20 rounded-full text-[#ff00cc]">+50 XP</span>
              </h3>
              <h4 className="text-[#00ffff] font-medium mb-1">{badge.name}</h4>
              <p className="text-sm text-gray-300">{badge.description}</p>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="ml-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Animated border */}
        <div className="h-1 w-full bg-gradient-to-r from-[#ff00cc] via-[#00ffff] to-[#ff00cc] bg-[length:200%_100%]" style={{
          animation: 'shimmer 2s linear infinite',
        }} />
      </div>

      {/* Add keyframes for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
};

export default BadgeUnlockedNotification;
