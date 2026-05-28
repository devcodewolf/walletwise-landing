import { useEffect, useRef } from 'react';

/**
 * AnimatedOrb — a subtle, elegant SVG gradient orb that morphs its shape
 * using CSS keyframes. Designed to be used as a background decorative element
 * behind the Hero or CTA sections.
 */
export default function AnimatedOrb() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Listen for theme changes to adapt gradient colors
    const updateColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const container = containerRef.current;
      if (!container) return;

      const stops = container.querySelectorAll('stop');
      if (stops.length >= 2) {
        if (isDark) {
          stops[0].setAttribute('stop-color', 'rgba(52,211,153,0.18)');
          stops[1].setAttribute('stop-color', 'rgba(6,182,212,0.06)');
        } else {
          stops[0].setAttribute('stop-color', 'rgba(5,150,105,0.12)');
          stops[1].setAttribute('stop-color', 'rgba(8,145,178,0.04)');
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
      <div
        className="orb-morph"
        style={{
          width: '65%',
          height: '65%',
          background: `
            radial-gradient(
              ellipse at center,
              rgba(52,211,153,0.15) 0%,
              rgba(52,211,153,0.04) 35%,
              transparent 70%
            )
          `,
          filter: 'blur(50px)',
          animation: 'orb-morph 10s ease-in-out infinite, orb-float 6s ease-in-out infinite',
        }}
      />
      {/* Second overlapping orb for depth */}
      <div
        className="orb-morph-secondary"
        style={{
          width: '45%',
          height: '45%',
          position: 'absolute',
          background: `
            radial-gradient(
              ellipse at center,
              rgba(6,182,212,0.08) 0%,
              rgba(6,182,212,0.02) 40%,
              transparent 70%
            )
          `,
          filter: 'blur(60px)',
          animation: 'orb-morph 12s ease-in-out infinite reverse, orb-float 7s ease-in-out infinite 1s',
        }}
      />
    </div>
  );
}
