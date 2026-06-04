import { Routes, Route, useLocation } from 'react-router-dom';
import { useGameState } from '@/context/GameStateContext';
import Layout from '@/components/Layout';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';

import SkillTreePage from '@/pages/SkillTreePage';
import PracticePage from '@/pages/PracticePage';
import ShopPage from '@/pages/ShopPage';
// ─────────────────────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────────────────────

export default function App() {
  const location = useLocation();
  const { onboardingComplete } = useGameState();

  // Onboarding check — will be the full wizard in M7
  if (!onboardingComplete) {
    // Minimal bootstrap screen so the app is usable before M7
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          background: 'var(--bg-primary)',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }} aria-hidden="true">⚔️</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          DevQuest
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '300px', lineHeight: 1.6 }}>
          Level up your code. Every day.
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-faint)', marginBottom: '1.5rem' }}>
          Full onboarding wizard coming in Milestone 7.
        </p>
        <SkipOnboardingButton />
      </div>
    );
  }

  return (
    <Layout activePath={location.pathname}>
      <Routes>
        <Route path="/"          element={<SkillTreePage />} />
        <Route path="/practice"  element={<PracticePage />} />
        <Route path="/shop"      element={<ShopPage />} />
        <Route path="/profile"   element={<ProfilePage />} />
        <Route path="/settings"  element={<SettingsPage />} />
        {/* 404 fallback */}
        <Route path="*"          element={<SkillTreePage />} />
      </Routes>
    </Layout>
  );
}

// Temporary bootstrap button — bypasses onboarding until M7
function SkipOnboardingButton() {
  const { completeOnboarding } = useGameState();

  return (
    <button
      id="skip-onboarding-btn"
      className="btn btn-primary"
      onClick={() =>
        completeOnboarding({
          avatarId: 'hooded-coder',
          characterName: 'Hero',
          startingPathId: 'data-structures',
        })
      }
    >
      Enter DevQuest →
    </button>
  );
}
