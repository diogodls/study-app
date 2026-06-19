import { useNavigate } from 'react-router-dom';
import { Home, Dumbbell, ShoppingBag, User, Settings } from 'lucide-react';
import { useGameState } from '@/context/GameStateContext';
import type { ReactNode } from 'react';
import OfflineStatus from '@/components/OfflineStatus';

type NavItem = {
  path: string;
  label: string;
  Icon: typeof Home;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/',          label: 'Tree',     Icon: Home },
  { path: '/practice',  label: 'Arena',    Icon: Dumbbell },
  { path: '/shop',      label: 'Shop',     Icon: ShoppingBag },
  { path: '/profile',   label: 'Profile',  Icon: User },
  { path: '/settings',  label: 'Settings', Icon: Settings },
];

const MAX_LIVES = 5;

type LayoutProps = {
  children: ReactNode;
  activePath: string;
};

export default function Layout({ children, activePath }: LayoutProps) {
  const navigate = useNavigate();
  const { lives, streak, studyPoints, level, progress } = useGameState();

  return (
    <div className="app-layout">
      {/* ── Fixed Header ───────────────────────────────────── */}
      <header className="app-header" id="app-header">
        <OfflineStatus />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
            padding: '0 1rem',
            gap: '0.75rem',
          }}
        >
          {/* Hearts */}
          <div className="hearts-row" aria-label={`${lives} lives remaining`}>
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span
                key={i}
                className={`heart-icon ${i < lives ? 'filled' : 'empty'}`}
                aria-hidden="true"
              >
                ❤️
              </span>
            ))}
          </div>

          {/* XP bar */}
          <div className="xp-bar-wrap" style={{ flex: 1, minWidth: 0 }}>
            <span className="level-badge">Lv {level}</span>
            <div className="progress-track" style={{ flex: 1 }}>
              <div
                className="progress-fill"
                style={{ width: `${progress.percent}%` }}
                role="progressbar"
                aria-valuenow={progress.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          {/* Currency + Streak */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--warning)', fontFamily: 'var(--font-heading)' }}>
              💰 {studyPoints.toLocaleString()}
            </span>
            {streak > 0 && (
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-heading)' }}>
                🔥 {streak}
              </span>
            )}
          </div>
        </div>

        {/* XP bar decoration — 2px line under header */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, var(--accent-dim) 0%, var(--accent) ${progress.percent}%, var(--border) ${progress.percent}%)`,
          }}
        />
      </header>

      {/* ── Scrollable Main ────────────────────────────────── */}
      <main className="app-main" id="app-main">
        {children}
      </main>

      {/* ── Fixed Bottom Nav ──────────────────────────────── */}
      <nav className="app-nav" id="app-nav" aria-label="Main navigation">
        <div className="bottom-nav">
          {NAV_ITEMS.map(({ path, label, Icon }) => {
            const isActive = activePath === path;
            return (
              <button
                key={path}
                id={`nav-${label.toLowerCase()}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (!navigator.onLine && path === '/shop') return;
                  navigate(path);
                }}
                disabled={!navigator.onLine && path === '/shop'}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
