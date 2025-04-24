import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
  variant?: 'magenta' | 'cyan' | 'purple' | 'gradient' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  glow?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>((
  {
    children,
    className,
    variant = 'magenta',
    size = 'md',
    glow = true,
    loading = false,
    disabled = false,
    icon,
    asChild = false,
    ...props
  }, ref) => {
  // Base styles
  const baseStyles = 'relative rounded-md font-medium transition-all duration-300 flex items-center justify-center';

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    icon: 'p-2 aspect-square',
  };

  // Color styles based on variant
  const colorStyles = {
    magenta: 'bg-[#0a0a0a] text-[#01AAE9] border border-[#01AAE9]/50',
    cyan: 'bg-[#0a0a0a] text-[#01AAE9] border border-[#01AAE9]/50',
    purple: 'bg-[#121212] text-white border border-[#01AAE9]/30',
    gradient: 'bg-gradient-to-r from-[#01AAE9] to-[#01AAE9] text-white border-none',
    outline: 'bg-transparent text-[#01AAE9] border border-[#01AAE9]/50',
  };

  // Glow styles based on variant
  const glowStyles = glow ? {
    magenta: 'hover:shadow-[0_0_10px_rgba(1,170,233,0.5)] hover:border-[#01AAE9]',
    cyan: 'hover:shadow-[0_0_10px_rgba(1,170,233,0.5)] hover:border-[#01AAE9]',
    purple: 'hover:shadow-[0_0_10px_rgba(1,170,233,0.3)] hover:border-[#01AAE9]/60',
    gradient: 'hover:shadow-[0_0_15px_rgba(1,170,233,0.4)]',
    outline: 'hover:shadow-[0_0_10px_rgba(1,170,233,0.3)] hover:border-[#01AAE9]/80 hover:bg-[#01AAE9]/10',
  } : {
    magenta: '',
    cyan: '',
    purple: '',
    gradient: '',
    outline: '',
  };

  // Hover transform
  const hoverTransform = 'hover:-translate-y-0.5';

  // Disabled styles
  const disabledStyles = (disabled || loading)
    ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none'
    : '';

  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(
        baseStyles,
        sizeStyles[size],
        colorStyles[variant],
        glowStyles[variant],
        hoverTransform,
        disabledStyles,
        className
      )}
      disabled={disabled || loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {!loading && icon && (
        <span className="mr-2">{icon}</span>
      )}
      {children}

      {/* Subtle gradient overlay for non-gradient buttons */}
      {variant !== 'gradient' && (
        <span className="absolute inset-0 rounded-md bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      )}
    </Comp>
  );
});

NeonButton.displayName = 'NeonButton';

export default NeonButton;
