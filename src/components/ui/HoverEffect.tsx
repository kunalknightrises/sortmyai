import React from 'react';
import { cn } from '@/lib/utils';

type HoverEffectType = 'pulse' | 'lift' | 'glow' | 'ripple' | 'gradient';

interface HoverEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  effect: HoverEffectType;
  color?: 'blue' | 'gray' | 'white' | 'red';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const HoverEffect: React.FC<HoverEffectProps> = ({
  children,
  effect,
  color = 'blue',
  intensity = 'medium',
  className,
  ...props
}) => {
  // Base styles
  const baseStyles = 'transition-all duration-300 relative overflow-hidden';

  // Color styles
  const colorMap = {
    blue: {
      low: 'rgba(0, 102, 255, 0.2)',
      medium: 'rgba(0, 102, 255, 0.4)',
      high: 'rgba(0, 102, 255, 0.6)',
    },
    gray: {
      low: 'rgba(42, 42, 42, 0.2)',
      medium: 'rgba(42, 42, 42, 0.4)',
      high: 'rgba(42, 42, 42, 0.6)',
    },
    white: {
      low: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.2)',
      high: 'rgba(255, 255, 255, 0.3)',
    },
    red: {
      low: 'rgba(220, 38, 38, 0.2)',
      medium: 'rgba(220, 38, 38, 0.4)',
      high: 'rgba(220, 38, 38, 0.6)',
    },
  };

  // Effect styles
  const effectStyles = {
    pulse: 'hover-pulse',
    lift: 'hover-lift',
    glow: 'hover-glow',
    ripple: 'hover-ripple',
    gradient: 'hover-gradient',
  };

  // Add keyframes for effects
  React.useEffect(() => {
    const styleId = 'hover-effect-keyframes';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .hover-ripple::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: ${colorMap[color][intensity]};
          border-radius: inherit;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
          z-index: -1;
          transition: transform 0s;
        }

        .hover-ripple:hover::after {
          animation: ripple 0.6s ease-out;
        }

        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .hover-glow {
          transition: box-shadow 0.3s ease;
        }

        .hover-glow:hover {
          box-shadow: 0 0 15px ${colorMap[color][intensity]};
        }

        .hover-pulse {
          animation: none;
        }

        .hover-pulse:hover {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 ${colorMap[color][intensity]};
          }
          70% {
            box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
          }
        }

        .hover-gradient {
          background-size: 200% 100%;
          background-position: 100% 0;
          transition: background-position 0.5s ease;
        }

        .hover-gradient:hover {
          background-position: 0 0;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, [effect, color, intensity]);

  // Gradient background for gradient effect
  const gradientStyle = effect === 'gradient' ? {
    background: `linear-gradient(90deg, ${colorMap[color].medium}, transparent)`,
  } : {};

  return (
    <div
      className={cn(
        baseStyles,
        effectStyles[effect],
        className
      )}
      style={gradientStyle}
      {...props}
    >
      {children}
    </div>
  );
};

export default HoverEffect;
