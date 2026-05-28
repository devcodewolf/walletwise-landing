import { useEffect, useRef } from 'react';

/**
 * AnimatedOrb — Large, dramatic gradient orbs with morphing animation.
 * Vercel/Vite-inspired: green/cyan gradients, heavy blur, slow drift.
 * Multiple overlapping orbs create depth and visual richness.
 * Drift is on outer wrapper, morph on inner — avoids transform conflicts.
 */
export default function AnimatedOrb() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const container = containerRef.current;
      if (!container) return;

      const stops = container.querySelectorAll('stop');
      if (stops.length >= 4) {
        if (isDark) {
          stops[0].setAttribute('stop-color', 'rgba(52,211,153,0.25)');
          stops[1].setAttribute('stop-color', 'rgba(52,211,153,0.04)');
          stops[2].setAttribute('stop-color', 'rgba(6,182,212,0.18)');
          stops[3].setAttribute('stop-color', 'rgba(6,182,212,0.03)');
        } else {
          stops[0].setAttribute('stop-color', 'rgba(5,150,105,0.15)');
          stops[1].setAttribute('stop-color', 'rgba(5,150,105,0.03)');
          stops[2].setAttribute('stop-color', 'rgba(8,145,178,0.10)');
          stops[3].setAttribute('stop-color', 'rgba(8,145,178,0.02)');
        }
      }
    };

    updateColors();
    window.addEventListener('themechange' as any, updateColors);
    return () => window.removeEventListener('themechange' as any, updateColors);
  }, []);

  return (
    <div
      ref={containerRef}
      className="orb-animated"
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* ── Orb 1: Large emerald, morph + drift (wrapper for drift, inner for morph) ── */}
      <div
        style={{
          width: '75%',
          height: '75%',
          position: 'absolute',
          animation: 'orb-drift 14s ease-in-out infinite',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="orb-morph-primary"
          style={{
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(
                ellipse at 40% 30%,
                rgba(52,211,153,0.22) 0%,
                rgba(52,211,153,0.06) 30%,
                rgba(16,185,129,0.02) 55%,
                transparent 75%
              )
            `,
            filter: 'blur(70px)',
            animation: 'orb-morph-dramatic 12s ease-in-out infinite',
            willChange: 'border-radius, transform, filter',
          }}
        />
      </div>

      {/* ── Orb 2: Medium cyan, offset, slower ── */}
      <div
        style={{
          width: '55%',
          height: '55%',
          position: 'absolute',
          top: '5%',
          left: '10%',
          animation: 'orb-drift 16s ease-in-out infinite 2s',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="orb-morph-secondary"
          style={{
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(
                ellipse at 60% 60%,
                rgba(6,182,212,0.16) 0%,
                rgba(6,182,212,0.05) 28%,
                rgba(34,211,238,0.02) 50%,
                transparent 70%
              )
            `,
            filter: 'blur(80px)',
            animation: 'orb-morph-dramatic 14s ease-in-out infinite reverse',
            willChange: 'border-radius, transform, filter',
          }}
        />
      </div>

      {/* ── Orb 3: Small intense accent ── */}
      <div
        style={{
          width: '30%',
          height: '30%',
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          animation: 'orb-drift 12s ease-in-out infinite 1s',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="orb-morph-accent"
          style={{
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(
                ellipse at 30% 70%,
                rgba(82,229,180,0.18) 0%,
                rgba(52,211,153,0.06) 25%,
                transparent 60%
              )
            `,
            filter: 'blur(45px)',
            animation: 'orb-morph-dramatic 10s ease-in-out infinite 3s',
            willChange: 'border-radius, transform, filter',
          }}
        />
      </div>

      {/* SVG gradient defs for future dynamic color support */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <radialGradient id="orb-grad-1" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="rgba(52,211,153,0.25)" />
            <stop offset="100%" stopColor="rgba(52,211,153,0.04)" />
          </radialGradient>
          <radialGradient id="orb-grad-2" cx="60%" cy="60%" r="60%">
            <stop offset="0%" stopColor="rgba(6,182,212,0.18)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0.03)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
