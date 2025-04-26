import React, { useEffect, useRef } from 'react';

interface SynthwaveBackgroundProps {
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

const SynthwaveBackground: React.FC<SynthwaveBackgroundProps> = ({
  intensity = 'medium',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set intensity values - increased for better visibility
  const intensityValues = {
    low: { opacity: 0.7, speed: 0.5 },
    medium: { opacity: 0.8, speed: 1 },
    high: { opacity: 0.9, speed: 1.5 },
  };

  const { opacity, speed } = intensityValues[intensity];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Synthwave colors
    const colors = {
      purple: '#2a003f',
      darkPurple: '#0d001a',
      blue: '#0066ff',
      magenta: '#ff00cc',
      cyan: '#00ffff',
    };

    // Sun properties
    const sunRadius = Math.min(canvas.width, canvas.height) * 0.15;
    const sunY = canvas.height * 0.5;
    const horizonY = canvas.height * 0.6;

    // Grid properties
    const gridSpacing = 50;
    const gridLines = 20;

    // Animation variables
    let time = 0;

    // Draw sun
    const drawSun = () => {
      // Create gradient for sun
      const sunGradient = ctx.createRadialGradient(
        canvas.width / 2, sunY, 0,
        canvas.width / 2, sunY, sunRadius
      );

      sunGradient.addColorStop(0, '#ff00cc');
      sunGradient.addColorStop(0.5, '#ff0066');
      sunGradient.addColorStop(1, '#ff0000');

      ctx.beginPath();
      ctx.arc(canvas.width / 2, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = sunGradient;
      ctx.fill();

      // Add glow effect
      ctx.beginPath();
      ctx.arc(canvas.width / 2, sunY, sunRadius * 1.2, 0, Math.PI * 2);
      const glowGradient = ctx.createRadialGradient(
        canvas.width / 2, sunY, sunRadius,
        canvas.width / 2, sunY, sunRadius * 1.5
      );
      glowGradient.addColorStop(0, 'rgba(255, 0, 204, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 0, 204, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fill();
    };

    // Draw mountains
    const drawMountains = () => {
      // Background mountains
      ctx.beginPath();
      ctx.moveTo(0, horizonY);

      // Create jagged mountains
      const mountainCount = 5;
      const mountainWidth = canvas.width / mountainCount;

      for (let i = 0; i <= mountainCount; i++) {
        const x = i * mountainWidth;
        const y = horizonY - (Math.sin(i / mountainCount * Math.PI) * canvas.height * 0.2);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(canvas.width, horizonY);
      ctx.closePath();

      // Mountain gradient
      const mountainGradient = ctx.createLinearGradient(0, horizonY - canvas.height * 0.2, 0, horizonY);
      mountainGradient.addColorStop(0, colors.purple);
      mountainGradient.addColorStop(1, '#1a0029');

      ctx.fillStyle = mountainGradient;
      ctx.fill();
    };

    // Draw grid
    const drawGrid = () => {
      ctx.strokeStyle = colors.magenta;
      ctx.lineWidth = 1;

      // Perspective vanishing point
      const vanishingPointX = canvas.width / 2;
      const vanishingPointY = sunY;

      // Draw horizontal lines
      for (let i = 0; i <= gridLines; i++) {
        const progress = i / gridLines;
        const y = horizonY + (canvas.height - horizonY) * progress;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.globalAlpha = 0.3 - (progress * 0.3); // Fade out as lines get closer
        ctx.stroke();
      }

      // Draw vertical lines with perspective
      const verticalCount = Math.ceil(canvas.width / gridSpacing) + 1;

      for (let i = 0; i < verticalCount; i++) {
        const x = (i * gridSpacing + time * speed) % (canvas.width + gridSpacing) - gridSpacing / 2;

        ctx.beginPath();
        ctx.moveTo(x, horizonY);
        ctx.lineTo(
          vanishingPointX + (x - vanishingPointX) * 5,
          vanishingPointY
        );
        ctx.globalAlpha = 0.5;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    // Draw stars
    const drawStars = () => {
      const starCount = 100;
      ctx.fillStyle = 'white';

      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * horizonY * 0.8;
        const size = Math.random() * 2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    // Animation function
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, colors.darkPurple);
      bgGradient.addColorStop(0.5, colors.purple);
      bgGradient.addColorStop(1, colors.blue);

      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      drawStars();

      // Draw sun
      drawSun();

      // Draw mountains
      drawMountains();

      // Draw grid
      drawGrid();

      // Update time
      time += 0.5;

      // Request next frame
      requestAnimationFrame(animate);
    };

    // Start animation
    const animationId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [intensity, opacity, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full z-[-1] ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default SynthwaveBackground;
