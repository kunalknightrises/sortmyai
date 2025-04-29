import React, { useEffect, useRef } from 'react';

interface AuroraBackgroundProps {
  intensity?: number; // 0-100, controls opacity and movement
  className?: string;
}

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  intensity = 30,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const opacityLevel = intensity / 100 * 1.5; // Increased opacity for more visibility

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Aurora gradient colors - synthwave inspired with higher saturation
    const colors = [
      { r: 0, g: 102, b: 255 },    // SortMyAI Blue
      { r: 255, g: 0, b: 204 },    // Magenta
      { r: 0, g: 255, b: 255 },    // Cyan
      { r: 128, g: 0, b: 128 },    // Purple
      { r: 255, g: 165, b: 0 }     // Orange
    ];

    // Create more gradient points for a more dynamic effect
    const points = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4 * (intensity / 30), // Faster movement
      vy: (Math.random() - 0.5) * 0.4 * (intensity / 30),
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    const animate = () => {
      // Clear canvas with a very dark background with a slight purple tint
      ctx.fillStyle = '#0d001a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add a subtle vignette effect
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add a more visible grid effect
      if (intensity > 10) { // Lower threshold so it's always visible
        ctx.strokeStyle = 'rgba(14, 150, 213, 0.15)'; // More visible blue color
        ctx.lineWidth = 1;

        const gridSize = 40; // Smaller grid
        const gridOffsetX = (performance.now() * 0.01) % gridSize;
        const gridOffsetY = (performance.now() * 0.005) % gridSize;

        // Draw horizontal lines
        for (let y = gridOffsetY; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Draw vertical lines
        for (let x = gridOffsetX; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Add some random stars/points
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 2;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Move points
      points.forEach(point => {
        point.x += point.vx;
        point.y += point.vy;

        // Bounce off edges
        if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -1;
      });

      // Create gradients
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, canvas.width * 0.5
        );

        const { r, g, b } = point.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${opacityLevel})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [intensity, opacityLevel]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`}
      style={{ pointerEvents: 'none', opacity: 1 }} // Ensure full opacity
    />
  );
};

export default AuroraBackground;
