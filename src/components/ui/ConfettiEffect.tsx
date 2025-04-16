import React, { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
  active: boolean;
  duration?: number;
  particleCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  active,
  duration = 3000,
  particleCount = 100,
  colors = ['#ff00cc', '#00ffff', '#2a003f', '#0066ff', '#ff3399'],
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Create particles
  const createParticles = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create particles
    particlesRef.current = Array.from({ length: particleCount }, () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.3 - canvas.height * 0.1,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 6 - 3,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        opacity: 1,
      };
    });
  };
  
  // Animate particles
  const animateParticles = (timestamp: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set start time if not set
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }
    
    // Calculate elapsed time
    const elapsed = timestamp - startTimeRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Add gravity
      particle.speedY += 0.1;
      
      // Update rotation
      particle.rotation += particle.rotationSpeed;
      
      // Update opacity based on elapsed time
      if (elapsed > duration * 0.7) {
        particle.opacity = 1 - (elapsed - duration * 0.7) / (duration * 0.3);
      }
      
      // Draw particle
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = particle.opacity;
      
      if (particle.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      } else {
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      }
      
      ctx.restore();
    });
    
    // Continue animation if duration not exceeded
    if (elapsed < duration) {
      animationRef.current = requestAnimationFrame(animateParticles);
    } else {
      // Animation complete
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  // Start confetti effect
  useEffect(() => {
    if (active) {
      // Reset
      startTimeRef.current = null;
      
      // Create particles
      createParticles();
      
      // Start animation
      animationRef.current = requestAnimationFrame(animateParticles);
      
      // Handle window resize
      const handleResize = () => {
        if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [active, duration, particleCount, colors, onComplete]);
  
  if (!active) return null;
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default ConfettiEffect;
