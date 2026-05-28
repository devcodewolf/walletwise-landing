import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  alphaDir: number;
}

interface Props {
  /** Grid cell size in px */
  gridSize?: number;
  /** Number of floating particles */
  particleCount?: number;
  /** Particle color in light mode */
  lightColor?: string;
  /** Particle color in dark mode */
  darkColor?: string;
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Mouse parallax intensity (0-1) */
  mouseParallax?: number;
}

export default function AnimatedBackground({
  gridSize = 80,
  particleCount = 45,
  lightColor = 'rgba(15,23,42,0.06)',
  darkColor = 'rgba(255,255,255,0.04)',
  showGrid = true,
  mouseParallax = 0.02,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const themeRef = useRef<'dark' | 'light'>('dark');
  const prefersReducedMotion = useRef(false);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.5 + 0.2,
      alphaDir: Math.random() > 0.5 ? 0.002 : -0.002,
    }));
  }, [particleCount]);

  useEffect(() => {
    // Check reduced motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener('change', handleMotionChange);

    // Listen for theme changes
    const html = document.documentElement;
    themeRef.current = html.classList.contains('dark') ? 'dark' : 'light';

    const updateTheme = () => {
      themeRef.current = html.classList.contains('dark') ? 'dark' : 'light';
    };

    const obs = new MutationObserver(updateTheme);
    obs.observe(html, { attributes: true, attributeFilter: ['class'] });

    window.addEventListener('themechange' as any, updateTheme);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resize();
    const rect = canvas.getBoundingClientRect();
    initParticles(rect.width, rect.height);

    const draw = () => {
      if (!ctx || !canvas) return;
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = themeRef.current === 'dark';
      const particleColor = isDark ? darkColor : lightColor;
      const gridColor = isDark
        ? 'rgba(255,255,255,0.03)'
        : 'rgba(15,23,42,0.04)';

      // Draw grid
      if (showGrid && !prefersReducedMotion.current) {
        const mx = mouseRef.current.x * mouseParallax;
        const my = mouseRef.current.y * mouseParallax;
        const offsetX = (mx % gridSize + gridSize) % gridSize;
        const offsetY = (my % gridSize + gridSize) % gridSize;

        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;

        for (let x = -offsetX; x <= w + gridSize; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = -offsetY; y <= h + gridSize; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // Draw particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update position
        if (!prefersReducedMotion.current) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;

          // Pulse alpha
          p.alpha += p.alphaDir;
          if (p.alpha >= 0.6) p.alphaDir = -0.002;
          if (p.alpha <= 0.15) p.alphaDir = 0.002;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor.replace(
          /[\d.]+\)$/,
          `${(parseFloat(particleColor.match(/[\d.]+\)$/) || ['0']) * p.alpha).toFixed(3)})`
        );
        // Simpler: use a fixed alpha from the rgba string
        const baseAlpha = p.alpha;
        if (particleColor.startsWith('rgba')) {
          const parts = particleColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
          if (parts) {
            ctx.fillStyle = `rgba(${parts[1]},${parts[2]},${parts[3]},${(parseFloat(parts[4]) * baseAlpha * 1.5).toFixed(3)})`;
          } else {
            ctx.fillStyle = particleColor;
          }
        } else {
          ctx.fillStyle = particleColor;
        }
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      obs.disconnect();
      window.removeEventListener('themechange' as any, updateTheme);
      mq.removeEventListener('change', handleMotionChange);
    };
  }, [resize, initParticles, showGrid, mouseParallax, lightColor, darkColor, gridSize]);

  // Mouse tracking
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      resize();
      const rect = canvas.getBoundingClientRect();
      initParticles(rect.width, rect.height);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [resize, initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    />
  );
}
