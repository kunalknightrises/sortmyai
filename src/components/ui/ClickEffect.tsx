import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type ClickEffectType = 'flash' | 'bounce' | 'particles' | 'ripple';

interface ClickEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  effect: ClickEffectType;
  color?: 'blue' | 'gray' | 'white';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const ClickEffect: React.FC<ClickEffectProps> = ({
  children,
  effect,
  color = 'blue',
  intensity = 'medium',
  className,
  onClick,
  ...props
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, angle: number, speed: number}>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Base styles
  const baseStyles = 'relative overflow-hidden';
  
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
  };
  
  // Effect styles
  const effectStyles = {
    flash: 'click-flash',
    bounce: 'click-bounce',
    particles: '',
    ripple: 'click-ripple',
  };
  
  // Add keyframes for effects
  useEffect(() => {
    const styleId = 'click-effect-keyframes';
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        @keyframes flash {
          0% { background-color: transparent; }
          50% { background-color: ${colorMap[color][intensity]}; }
          100% { background-color: transparent; }
        }
        
        .click-flash.animating {
          animation: flash 0.3s ease-out;
        }
        
        @keyframes bounce {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        .click-bounce.animating {
          animation: bounce 0.3s ease-out;
        }
        
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.5;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        .click-ripple-circle {
          position: absolute;
          background: ${colorMap[color][intensity]};
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s ease-out forwards;
          pointer-events: none;
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, [color, intensity]);
  
  // Handle click
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Trigger animation
    setIsAnimating(true);
    
    // For ripple effect
    if (effect === 'ripple' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Create ripple element
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple-circle';
      ripple.style.width = `${Math.max(rect.width, rect.height) * 2}px`;
      ripple.style.height = `${Math.max(rect.width, rect.height) * 2}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      containerRef.current.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        if (containerRef.current && containerRef.current.contains(ripple)) {
          containerRef.current.removeChild(ripple);
        }
      }, 600);
    }
    
    // For particles effect
    if (effect === 'particles') {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Create particles
        const newParticles = Array.from({ length: 10 }, (_, i) => ({
          id: Date.now() + i,
          x,
          y,
          size: Math.random() * 6 + 2,
          angle: Math.random() * Math.PI * 2,
          speed: Math.random() * 3 + 1,
        }));
        
        setParticles(prev => [...prev, ...newParticles]);
        
        // Remove particles after animation
        setTimeout(() => {
          setParticles(prev => prev.filter(p => !newParticles.includes(p)));
        }, 1000);
      }
    }
    
    // Reset animation state
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
    
    // Call original onClick handler
    if (onClick) {
      onClick(e);
    }
  };
  
  return (
    <div
      ref={containerRef}
      className={cn(
        baseStyles,
        effectStyles[effect],
        isAnimating && 'animating',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      
      {/* Particles */}
      {effect === 'particles' && particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            background: colorMap[color][intensity],
            transform: `translate(-50%, -50%)`,
            animation: `particle-${particle.id} 1s forwards`,
          }}
        />
      ))}
      
      {/* Add keyframes for each particle */}
      {effect === 'particles' && (
        <style>
          {particles.map(particle => `
            @keyframes particle-${particle.id} {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
              }
              100% {
                transform: 
                  translate(
                    calc(-50% + ${Math.cos(particle.angle) * 50 * particle.speed}px), 
                    calc(-50% + ${Math.sin(particle.angle) * 50 * particle.speed}px)
                  ) 
                  scale(0);
                opacity: 0;
              }
            }
          `).join('')}
        </style>
      )}
    </div>
  );
};

export default ClickEffect;
