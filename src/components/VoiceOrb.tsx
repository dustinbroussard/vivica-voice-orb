
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface VoiceOrbProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  volume?: number;
  className?: string;
}

const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, volume = 0, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    opacity: number;
  }

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const createParticle = (x: number, y: number): Particle => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1,
      maxLife: 1,
      size: Math.random() * 3 + 1,
      color: getStateColor(state),
      opacity: Math.random() * 0.8 + 0.2,
    });

    const getStateColor = (currentState: string): string => {
      switch (currentState) {
        case 'listening': return '#9048F8'; // vivica-purple
        case 'processing': return '#E830E8'; // vivica-magenta  
        case 'speaking': return '#FF61E6'; // vivica-pink
        case 'error': return '#FF4444';
        default: return '#4A1259'; // vivica-deep
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.1;
      const volumeRadius = volume * baseRadius * 2;
      const finalRadius = baseRadius + volumeRadius;

      // Draw outer glow
      const outerGradient = ctx.createRadialGradient(
        centerX, centerY, finalRadius * 0.5,
        centerX, centerY, finalRadius * 3
      );
      const stateColor = getStateColor(state);
      outerGradient.addColorStop(0, `${stateColor}40`);
      outerGradient.addColorStop(0.5, `${stateColor}20`);
      outerGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = outerGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw main orb
      const mainGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, finalRadius
      );
      mainGradient.addColorStop(0, `${stateColor}FF`);
      mainGradient.addColorStop(0.3, `${stateColor}CC`);
      mainGradient.addColorStop(0.7, `${stateColor}66`);
      mainGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, finalRadius, 0, Math.PI * 2);
      ctx.fillStyle = mainGradient;
      ctx.fill();

      // Create particles based on state
      if (state !== 'idle' && Math.random() < 0.3) {
        const particleCount = state === 'processing' ? 3 : state === 'speaking' ? 2 : 1;
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = finalRadius * (0.7 + Math.random() * 0.3);
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          particlesRef.current.push(createParticle(x, y));
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        if (particle.life > 0) {
          ctx.save();
          ctx.globalAlpha = particle.life * particle.opacity;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          return true;
        }
        return false;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, state, volume]);

  const getOrbClasses = () => {
    switch (state) {
      case 'listening': return 'vivica-orb-listening';
      case 'processing': return 'vivica-orb-processing'; 
      case 'speaking': return 'vivica-orb-speaking';
      case 'error': return 'vivica-orb-idle opacity-50';
      default: return 'vivica-orb-idle';
    }
  };

  return (
    <div className={cn("fixed inset-0 pointer-events-none", className)}>
      <canvas
        ref={canvasRef}
        className={cn("w-full h-full", getOrbClasses())}
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default VoiceOrb;
