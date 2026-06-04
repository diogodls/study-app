import { Routes, Route, useLocation } from 'react-router-dom';
import { useGameState } from '@/context/GameStateContext';
import Layout from '@/components/Layout';
import OnboardingFlow from '@/components/OnboardingFlow';
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

  if (!onboardingComplete) {
    return <OnboardingFlow />;
  }

  return (
    <Layout activePath={location.pathname}>
      <Routes>
        <Route path="/"         element={<SkillTreePage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/shop"     element={<ShopPage />} />
        <Route path="/profile"  element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*"         element={<SkillTreePage />} />
      </Routes>
    </Layout>
  );
}
