import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  alphaDir: number;
  hue: number; // 0-360 for accent/cyan rotation
}

interface Connection {
  a: number;
  b: number;
  alpha: number;
}

interface Props {
  gridSize?: number;
  particleCount?: number;
  lightColor?: string;
  darkColor?: string;
  showGrid?: boolean;
  mouseParallax?: number;
}

export default function AnimatedBackground({
  gridSize = 90,
  particleCount = 80,
  lightColor = 'rgba(15,23,42,0.06)',
  darkColor = 'rgba(255,255,255,0.04)',
  showGrid = true,
  mouseParallax = 0.015,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const themeRef = useRef<'dark' | 'light'>('dark');
  const prefersReducedMotion = useRef(false);
  const dimsRef = useRef({ w: 0, h: 0 });

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    dimsRef.current = { w: rect.width, h: rect.height };
  }, []);

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2.0 + 1.0,
      alpha: Math.random() * 0.6 + 0.2,
      alphaDir: (Math.random() - 0.5) * 0.004,
      hue: Math.random() < 0.65 ? 160 : 190, // mostly emerald, some cyan
    }));
  }, [particleCount]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener('change', handleMotionChange);

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
    const { w, h } = dimsRef.current;
    initParticles(w, h);

    const draw = () => {
      if (!ctx || !canvas) return;
      const w = dimsRef.current.w;
      const h = dimsRef.current.h;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const isDark = themeRef.current === 'dark';
      const reduced = prefersReducedMotion.current;

      // ── Grid ──
      if (showGrid && !reduced) {
        const mx = mouseRef.current.x * mouseParallax;
        const my = mouseRef.current.y * mouseParallax;
        const offsetX = ((mx % gridSize) + gridSize) % gridSize;
        const offsetY = ((my % gridSize) + gridSize) % gridSize;
        const gridAlpha = isDark ? 0.025 : 0.04;

        ctx.strokeStyle = isDark
          ? `rgba(255,255,255,${gridAlpha})`
          : `rgba(15,23,42,${gridAlpha})`;
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

      // ── Particles ──
      const particles = particlesRef.current;
      const connectionDist = isDark ? 110 : 90;

      // Build connections list
      const connections: Connection[] = [];
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            connections.push({
              a: i,
              b: j,
              alpha: 1 - dist / connectionDist,
            });
          }
        }
      }

      // Draw connections (subtle web)
      for (const conn of connections) {
        const a = particles[conn.a];
        const b = particles[conn.b];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = isDark
          ? `rgba(52,211,153,${(conn.alpha * 0.08).toFixed(3)})`
          : `rgba(5,150,105,${(conn.alpha * 0.06).toFixed(3)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;

          // Pulse alpha
          p.alpha += p.alphaDir;
          if (p.alpha >= 0.85) p.alphaDir = -0.004;
          if (p.alpha <= 0.15) p.alphaDir = 0.004;
        }

        // Glow circle behind particle
        const glowRadius = p.radius * 4;
        const glow = ctx.createRadialGradient(p.x, p.y, p.radius * 0.5, p.x, p.y, glowRadius);

        if (isDark) {
          if (p.hue < 170) {
            // Emerald accent
            glow.addColorStop(0, `rgba(52,211,153,${(p.alpha * 0.35).toFixed(3)})`);
            glow.addColorStop(0.4, `rgba(52,211,153,${(p.alpha * 0.1).toFixed(3)})`);
            glow.addColorStop(1, 'rgba(52,211,153,0)');
          } else {
            // Cyan
            glow.addColorStop(0, `rgba(6,182,212,${(p.alpha * 0.3).toFixed(3)})`);
            glow.addColorStop(0.4, `rgba(6,182,212,${(p.alpha * 0.08).toFixed(3)})`);
            glow.addColorStop(1, 'rgba(6,182,212,0)');
          }
        } else {
          glow.addColorStop(0, `rgba(5,150,105,${(p.alpha * 0.2).toFixed(3)})`);
          glow.addColorStop(0.4, `rgba(5,150,105,${(p.alpha * 0.06).toFixed(3)})`);
          glow.addColorStop(1, 'rgba(5,150,105,0)');
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (isDark) {
          if (p.hue < 170) {
            ctx.fillStyle = `rgba(82,229,180,${(p.alpha * 1.1).toFixed(3)})`;
          } else {
            ctx.fillStyle = `rgba(34,211,238,${(p.alpha * 1.0).toFixed(3)})`;
          }
        } else {
          ctx.fillStyle = `rgba(5,150,105,${(p.alpha * 0.9).toFixed(3)})`;
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
  }, [resize, initParticles, showGrid, mouseParallax, gridSize]);

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
      initParticles(dimsRef.current.w, dimsRef.current.h);
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
