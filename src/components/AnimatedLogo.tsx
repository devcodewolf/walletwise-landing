import { useState, useEffect, useRef } from 'react';

export default function AnimatedLogo() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;

    const html = document.documentElement;
    setTheme(html.classList.contains('dark') ? 'dark' : 'light');
    setMounted(true);

    const updateTheme = () => {
      setTheme(html.classList.contains('dark') ? 'dark' : 'light');
    };

    window.addEventListener('themechange' as any, updateTheme);
    const obs = new MutationObserver(updateTheme);
    obs.observe(html, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('themechange' as any, updateTheme);
      obs.disconnect();
    };
  }, []);

  const isDark = theme === 'dark';
  const gradientId = 'logo-grad-anim';
  const glowId = 'logo-glow-anim';

  // Dark gradient: emerald to cyan, Light gradient: emerald to teal
  const gradStart = isDark ? '#34d399' : '#059669';
  const gradEnd = isDark ? '#06b6d4' : '#0891b2';
  const glowColor = isDark ? 'rgba(52,211,153,0.3)' : 'rgba(5,150,105,0.2)';

  return (
    <div className="relative inline-flex" aria-hidden="true">
      <svg
        width="80"
        height="80"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={mounted && !prefersReducedMotion.current ? 'animate-logo-pulse' : ''}
        style={{
          filter: `drop-shadow(0 0 12px ${glowColor})`,
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32">
            <stop stopColor={gradStart} />
            <stop offset="1" stopColor={gradEnd} />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background rect */}
        <rect
          width="32"
          height="32"
          rx="8"
          fill={`url(#${gradientId})`}
          className={mounted && !prefersReducedMotion.current ? 'animate-logo-rect' : ''}
        />

        {/* Checkmark with stroke animation */}
        <path
          d="M10 16.5L14 20.5L22 12.5"
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="20"
          strokeDashoffset={mounted && !prefersReducedMotion.current ? undefined : '0'}
          className={
            mounted && !prefersReducedMotion.current
              ? 'animate-logo-draw'
              : ''
          }
          style={
            mounted && !prefersReducedMotion.current
              ? undefined
              : { strokeDashoffset: 0 }
          }
        />
      </svg>
    </div>
  );
}
