import { useState, useEffect } from 'react';

const METRICS = [
  { label: 'Ingresos', value: 2450.0, color: 'var(--color-accent)', prefix: '+' },
  { label: 'Gastos', value: 1320.5, color: '#ef4444', prefix: '-' },
  { label: 'Balance', value: 1129.5, color: 'var(--color-cyan)', prefix: '' },
];

const BAR_DATA = [
  { month: 'Ene', ingreso: 2200, gasto: 1100 },
  { month: 'Feb', ingreso: 2200, gasto: 1400 },
  { month: 'Mar', ingreso: 2450, gasto: 1200 },
  { month: 'Abr', ingreso: 2300, gasto: 1350 },
  { month: 'May', ingreso: 2450, gasto: 1320 },
  { month: 'Jun', ingreso: 0, gasto: 0 },
];

const TRANSACTIONS = [
  { desc: 'Nómina mensual', amount: 2100.0, type: 'income', date: 'Hoy', cat: 'salary' },
  { desc: 'Mercadona', amount: 67.3, type: 'expense', date: 'Ayer', cat: 'food' },
  { desc: 'Netflix', amount: 12.99, type: 'expense', date: 'Hace 2 d.', cat: 'subscription' },
  { desc: 'Transferencia', amount: 350.0, type: 'income', date: 'Hace 3 d.', cat: 'transfer' },
  { desc: 'Alquiler mayo', amount: 650.0, type: 'expense', date: 'Hace 5 d.', cat: 'rent' },
];

// ---- Helpers ----

function formatCurrency(n: number): string {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function catIcon(cat: string) {
  switch (cat) {
    case 'salary': return <SalaryIcon />;
    case 'food': return <FoodIcon />;
    case 'subscription': return <SubIcon />;
    case 'transfer': return <TransferIcon />;
    case 'rent': return <RentIcon />;
    default: return <DefaultIcon />;
  }
}

// easeOutExpo: for smoother, Linear-style counter
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// ---- Animated counter hook with easeOutExpo ----
function useCountUp(target: number, duration: number, active: boolean): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      setVal(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return val;
}

// ---- SVG Icons ----

function SalaryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="17" y1="16" x2="17.01" y2="16" />
      <line x1="13" y1="16" x2="13.01" y2="16" />
      <line x1="9" y1="16" x2="9.01" y2="16" />
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

function SubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function RentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function DefaultIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function SidebarIcon({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 8,
        color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
        background: active ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </div>
  );
}

// ---- Bar chart (pure CSS) ----
function MiniBarChart() {
  const maxVal = Math.max(...BAR_DATA.map((d) => Math.max(d.ingreso, d.gasto)));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130, padding: '0 4px' }}>
      {BAR_DATA.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 100, width: '100%', justifyContent: 'center' }}>
            <div
              style={{
                width: 10,
                height: `${(d.ingreso / maxVal) * 100}%`,
                background: 'var(--color-chart-bar)',
                borderRadius: '3px 3px 0 0',
                minHeight: d.ingreso > 0 ? 4 : 0,
                transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
            <div
              style={{
                width: 10,
                height: `${(d.gasto / maxVal) * 100}%`,
                background: 'var(--color-chart-bar-alt)',
                borderRadius: '3px 3px 0 0',
                minHeight: d.gasto > 0 ? 4 : 0,
                transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
              }}
            />
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Main component ----
export default function AppPreview() {
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Listen for theme changes
  useEffect(() => {
    const html = document.documentElement;
    setMounted(true);
    setTheme(html.classList.contains('dark') ? 'dark' : 'light');

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.theme) setTheme(detail.theme);
    };
    window.addEventListener('themechange', handler);

    // Observe mutations as fallback
    const obs = new MutationObserver(() => {
      setTheme(html.classList.contains('dark') ? 'dark' : 'light');
    });
    obs.observe(html, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('themechange', handler);
      obs.disconnect();
    };
  }, []);

  // Trigger animation on mount
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 400);
    return () => clearTimeout(t);
  }, []);

  const isDark = theme === 'dark';

  const countUpIncome = useCountUp(2450, 1400, active);
  const countUpExpense = useCountUp(1320.5, 1600, active);
  const countUpBalance = useCountUp(1129.5, 1800, active);

  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.018)' : 'rgba(0,0,0,0.018)';
  const sidebarBg = isDark ? 'rgba(255,255,255,0.012)' : 'rgba(0,0,0,0.012)';

  return (
    <section className="app-preview-section" aria-label="Vista previa del dashboard de WalletWise" style={{ padding: '5rem 1.5rem 7rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <div data-reveal style={{ marginBottom: '3.5rem' }}>
          <h2 className="section-heading" style={{ marginBottom: '1rem' }}>
            Una interfaz <span className="gradient-text">limpia y potente</span>
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6, letterSpacing: '-0.01em' }}>
            Así es como se ve WalletWise por dentro. Un dashboard diseñado para la claridad, no para la confusión.
          </p>
        </div>

        <div
          data-reveal
          style={{
            display: 'flex',
            borderRadius: 12,
            boxShadow: `0 0 0 1px ${borderColor}`,
            overflow: 'hidden',
            background: surfaceBg,
            transition: 'all 0.3s',
            minHeight: 440,
          }}
        >
          {/* Sidebar */}
          <div
            style={{
              width: 52,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '14px 0',
              gap: 6,
              boxShadow: `inset -1px 0 0 ${borderColor}`,
              background: sidebarBg,
            }}
          >
            {/* Logo mini */}
            <div style={{ marginBottom: 10 }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#ap-logo-g)" />
                <path d="M10 16.5L14 20.5L22 12.5" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="ap-logo-g" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#34d399" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <SidebarIcon active>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </SidebarIcon>
            <SidebarIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1v22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </SidebarIcon>
            <SidebarIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </SidebarIcon>
            <SidebarIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </SidebarIcon>
            <SidebarIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </SidebarIcon>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Top bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 18px',
                boxShadow: `inset 0 -1px 0 ${borderColor}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Buscar transacciones...</span>
              </div>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-cyan))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  fontFamily: 'var(--font-display)',
                }}
              >
                U
              </div>
            </div>

            {/* Dashboard content */}
            <div style={{ padding: '18px 20px', flex: 1 }}>
              {/* Metric cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                <MetricCard label="Ingresos" value={countUpIncome} prefix="+" color="var(--color-accent)" />
                <MetricCard label="Gastos" value={countUpExpense} prefix="-" color="#ef4444" />
                <MetricCard label="Balance" value={countUpBalance} prefix="" color="var(--color-cyan)" />
              </div>

              {/* Chart + transactions row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Mini bar chart */}
                <div
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    boxShadow: `0 0 0 1px ${borderColor}`,
                    background: isDark ? 'rgba(255,255,255,0.012)' : 'rgba(0,0,0,0.01)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)' }}>
                      Ingresos vs Gastos
                    </span>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--color-chart-bar)' }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>Ing</span>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--color-chart-bar-alt)' }} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>Gas</span>
                  </div>
                  {mounted && <MiniBarChart />}
                </div>

                {/* Recent transactions */}
                <div
                  style={{
                    padding: 14,
                    borderRadius: 8,
                    boxShadow: `0 0 0 1px ${borderColor}`,
                    background: isDark ? 'rgba(255,255,255,0.012)' : 'rgba(0,0,0,0.01)',
                  }}
                >
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                    Transacciones recientes
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {TRANSACTIONS.map((tx, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '4px 0',
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 7,
                            background: tx.type === 'income' ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'color-mix(in srgb, #ef4444 10%, transparent)',
                            color: tx.type === 'income' ? 'var(--color-accent)' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {catIcon(tx.cat)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tx.desc}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {tx.date}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                            color: tx.type === 'income' ? 'var(--color-accent)' : '#ef4444',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tx.type === 'income' ? '+' : '-'}€{formatCurrency(tx.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Metric card subcomponent (Linear-style) ----
function MetricCard({ label, value, prefix, color }: { label: string; value: number; prefix: string; color: string }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 8,
        boxShadow: '0 0 0 1px var(--color-border)',
        background: 'var(--color-bg-card)',
        transition: 'box-shadow 0.15s ease',
      }}
    >
      <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color, letterSpacing: '-0.03em' }}>
        {prefix}€{formatCurrency(value)}
      </div>
    </div>
  );
}
