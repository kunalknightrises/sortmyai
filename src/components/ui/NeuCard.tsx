import React from 'react';
import { cn } from '@/lib/utils';

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'flat' | 'pressed' | 'elevated';
  color?: 'dark' | 'purple' | 'blue';
  interactive?: boolean;
}

const NeuCard: React.FC<NeuCardProps> = ({
  children,
  className,
  variant = 'flat',
  color = 'dark',
  interactive = true,
  ...props
}) => {
  // Base styles
  const baseStyles = 'rounded-xl transition-all duration-300';

  // Background color based on color prop
  const bgColor = {
    dark: 'bg-[#0a0a0a]',
    purple: 'bg-[#121212]',
    blue: 'bg-[#0066ff]/10',
  };

  // Shadow styles based on variant
  const shadowStyles = {
    flat: 'shadow-[5px_5px_10px_rgba(0,0,0,0.3),-5px_-5px_10px_rgba(83,0,134,0.05)]',
    pressed: 'shadow-[inset_5px_5px_10px_rgba(0,0,0,0.3),inset_-5px_-5px_10px_rgba(83,0,134,0.05)]',
    elevated: 'shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(83,0,134,0.1)]',
  };

  // Interactive hover/active effects
  const interactiveStyles = interactive
    ? variant === 'pressed'
      ? 'hover:shadow-[inset_8px_8px_16px_rgba(0,0,0,0.4),inset_-8px_-8px_16px_rgba(83,0,134,0.1)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.3),inset_-3px_-3px_6px_rgba(83,0,134,0.05)]'
      : 'hover:shadow-[10px_10px_20px_rgba(0,0,0,0.5),-10px_-10px_20px_rgba(83,0,134,0.15)] hover:-translate-y-1 active:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.3),inset_-5px_-5px_10px_rgba(83,0,134,0.05)] active:translate-y-0'
    : '';

  return (
    <div
      className={cn(
        baseStyles,
        bgColor[color],
        shadowStyles[variant],
        interactiveStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default NeuCard;
