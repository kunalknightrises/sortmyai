import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'glowing';
  intensity?: 'low' | 'medium' | 'high';
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  intensity = 'medium',
  ...props
}) => {
  // Base styles
  const baseStyles = 'rounded-xl backdrop-blur-md transition-all duration-300';

  // Background opacity based on intensity
  const bgIntensity = {
    low: 'bg-black/20',
    medium: 'bg-black/40',
    high: 'bg-black/60',
  };

  // Border styles based on variant
  const borderStyles = {
    default: 'border border-white/10',
    bordered: 'border border-[#0066ff]/30',
    glowing: 'border border-[#0066ff]/40',
  };

  // Shadow styles based on variant
  const shadowStyles = {
    default: '',
    bordered: 'shadow-lg',
    glowing: 'shadow-lg shadow-[#00ffff]/20',
  };

  // Hover effects
  const hoverStyles = {
    default: 'hover:border-white/20',
    bordered: 'hover:border-[#0E96D5]/60 hover:shadow-[#0E96D5]/20',
    glowing: 'hover:border-[#0E96D5]/70 hover:shadow-[#0E96D5]/30 hover:shadow-xl',
  };

  return (
    <div
      className={cn(
        baseStyles,
        bgIntensity[intensity],
        borderStyles[variant],
        shadowStyles[variant],
        hoverStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
