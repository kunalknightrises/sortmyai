import React from 'react';
import { cn } from '@/lib/utils';

interface NeonSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'avatar';
  width?: string;
  height?: string;
}

const NeonSkeleton: React.FC<NeonSkeletonProps> = ({
  className,
  variant = 'default',
  width,
  height,
  ...props
}) => {
  // Base styles
  const baseStyles = 'animate-pulse bg-gradient-to-r from-[#0d001a] via-[#2a003f]/40 to-[#0d001a] bg-[length:200%_100%] animate-shimmer';
  
  // Variant styles
  const variantStyles = {
    default: 'rounded-md',
    card: 'rounded-xl',
    text: 'h-4 rounded',
    avatar: 'rounded-full',
  };
  
  // Add keyframes for shimmer animation to the document if not already present
  React.useEffect(() => {
    const styleId = 'neon-skeleton-keyframes';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);
  
  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        className
      )}
      style={{
        width: width,
        height: height,
        boxShadow: '0 0 10px rgba(255, 0, 204, 0.1)',
        ...props.style,
      }}
      {...props}
    />
  );
};

export default NeonSkeleton;
