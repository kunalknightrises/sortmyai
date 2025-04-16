import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  contentClassName?: string;
  animation?: 'fade' | 'scale' | 'slide';
}

const AnimatedTooltip: React.FC<AnimatedTooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className,
  contentClassName,
  animation = 'fade',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  // Position styles
  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  // Arrow styles
  const arrowStyles = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
  };
  
  // Animation styles
  const animationStyles = {
    fade: {
      initial: 'opacity-0',
      animate: 'opacity-100',
    },
    scale: {
      initial: 'opacity-0 scale-75',
      animate: 'opacity-100 scale-100',
    },
    slide: {
      initial: {
        top: 'opacity-0 -translate-y-2',
        bottom: 'opacity-0 translate-y-2',
        left: 'opacity-0 -translate-x-2',
        right: 'opacity-0 translate-x-2',
      },
      animate: {
        top: 'opacity-100 translate-y-0',
        bottom: 'opacity-100 translate-y-0',
        left: 'opacity-100 translate-x-0',
        right: 'opacity-100 translate-x-0',
      },
    },
  };
  
  // Get animation classes
  const getAnimationClasses = () => {
    if (animation === 'slide') {
      return isVisible 
        ? animationStyles.slide.animate[position] 
        : animationStyles.slide.initial[position];
    }
    
    return isVisible 
      ? animationStyles[animation].animate 
      : animationStyles[animation].initial;
  };
  
  // Handle mouse enter
  const handleMouseEnter = () => {
    setIsHovering(true);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    
    setTimeoutId(id);
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
    
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    const id = setTimeout(() => {
      if (!isHovering) {
        setIsVisible(false);
      }
    }, 100);
    
    setTimeoutId(id);
  };
  
  return (
    <div 
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Tooltip */}
      <div 
        className={cn(
          "absolute z-50 whitespace-nowrap transition-all duration-200",
          positionStyles[position],
          getAnimationClasses(),
          isVisible ? 'pointer-events-auto' : 'pointer-events-none',
          contentClassName
        )}
      >
        {/* Tooltip content */}
        <div className="bg-sortmy-darker text-white text-sm py-1.5 px-3 rounded shadow-lg border border-sortmy-gray/30 backdrop-blur-sm">
          {content}
        </div>
        
        {/* Tooltip arrow */}
        <div 
          className={cn(
            "absolute w-0 h-0 border-4 border-sortmy-darker",
            arrowStyles[position]
          )}
        />
      </div>
    </div>
  );
};

export default AnimatedTooltip;
