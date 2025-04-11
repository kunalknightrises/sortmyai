
import React from 'react';
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";

interface AnimatedElementProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: "100" | "200" | "300" | "400";
}

export const FadeInUp = React.forwardRef<HTMLDivElement, AnimatedElementProps>(
  ({ children, className, delay = "100", ...props }, ref) => {
    const { ref: inViewRef, isInView } = useInView({ threshold: 0.1 });

    return (
      <div
        ref={(node) => {
          // Merge refs
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          if (inViewRef.current !== node) {
            // @ts-ignore - This is a safe operation despite the TS error
            inViewRef.current = node;
          }
        }}
        className={cn(
          'opacity-0',
          isInView && 'animate-fade-in-up',
          `delay-${delay}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FadeInUp.displayName = 'FadeInUp';

export const SlideIn = React.forwardRef<HTMLDivElement, AnimatedElementProps>(
  ({ children, className, delay = "100", ...props }, ref) => {
    const { ref: inViewRef, isInView } = useInView({ threshold: 0.1 });

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          if (inViewRef.current !== node) {
            // @ts-ignore - This is a safe operation despite the TS error
            inViewRef.current = node;
          }
        }}
        className={cn(
          'opacity-0',
          isInView && 'animate-slide-in',
          `delay-${delay}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SlideIn.displayName = 'SlideIn';

export const ScaleIn = React.forwardRef<HTMLDivElement, AnimatedElementProps>(
  ({ children, className, delay = "100", ...props }, ref) => {
    const { ref: inViewRef, isInView } = useInView({ threshold: 0.1 });

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          if (inViewRef.current !== node) {
            // @ts-ignore - This is a safe operation despite the TS error
            inViewRef.current = node;
          }
        }}
        className={cn(
          'opacity-0',
          isInView && 'animate-scale-in',
          `delay-${delay}`,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ScaleIn.displayName = 'ScaleIn';
