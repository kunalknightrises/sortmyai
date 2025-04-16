import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface AISuggestionProps {
  suggestion: string;
  actionText?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const AISuggestion: React.FC<AISuggestionProps> = ({
  suggestion,
  actionText = 'Try it',
  onAction,
  onDismiss,
  className,
  autoHide = false,
  autoHideDelay = 10000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Auto-hide suggestion after delay
  useEffect(() => {
    if (autoHide && isVisible) {
      const timeout = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      
      return () => clearTimeout(timeout);
    }
  }, [autoHide, autoHideDelay, isVisible]);
  
  // Handle dismiss
  const handleDismiss = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }, 300);
  };
  
  // Handle action
  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    handleDismiss();
  };
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div 
      className={cn(
        "relative bg-sortmy-darker border border-sortmy-blue/20 rounded-lg p-4 shadow-lg transition-all duration-300",
        isAnimating && "opacity-0 transform translate-y-4",
        className
      )}
    >
      {/* Sparkle effect in the background */}
      <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-sortmy-blue/10 animate-pulse" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sortmy-blue/10 animate-pulse delay-300" />
      
      {/* Content */}
      <div className="flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-sortmy-blue/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-sortmy-blue" />
          </div>
        </div>
        
        {/* Text and action */}
        <div className="flex-1">
          <p className="text-sm text-gray-300 mb-3">{suggestion}</p>
          
          {onAction && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs border-sortmy-blue/30 text-sortmy-blue hover:bg-sortmy-blue/10"
              onClick={handleAction}
            >
              {actionText}
              <ChevronRight className="ml-1 w-3 h-3" />
            </Button>
          )}
        </div>
        
        {/* Dismiss button */}
        <button 
          className="ml-2 text-gray-400 hover:text-white transition-colors"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AISuggestion;
