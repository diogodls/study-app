import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useGameState } from '@/context/GameStateContext';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import OnboardingFlow from '@/components/OnboardingFlow';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import SkillTreePage from '@/pages/SkillTreePage';
import PracticePage from '@/pages/PracticePage';
import ShopPage from '@/pages/ShopPage';
import AuthPage from '@/pages/AuthPage';
import ApiKeySetupPage from '@/pages/ApiKeySetupPage';
import GeminiLoadingState from '@/components/GeminiLoadingState';
import {
  cancelStudyReminder,
  initializeNotificationRouting,
  scheduleStudyReminder,
} from '@/services/notificationService';

// ─────────────────────────────────────────────────────────────
// App Root
// ─────────────────────────────────────────────────────────────

export default function App() {
  const location = useLocation();
  const { session, loading: authLoading, keyLoading, hasGeminiKey } = useAuth();
  const {
    onboardingComplete,
    cloudLoading,
    studyReminderEnabled,
    studyReminderTime,
    streak,
    lastStudyDate,
  } = useGameState();

  useEffect(() => {
    initializeNotificationRouting();
  }, []);

  useEffect(() => {
    if (!session) return;
    if (!studyReminderEnabled) {
      void cancelStudyReminder();
      return;
    }
    void scheduleStudyReminder(studyReminderTime, streak, lastStudyDate).catch(() => undefined);
  }, [session, studyReminderEnabled, studyReminderTime, streak, lastStudyDate]);

  if (authLoading || cloudLoading || keyLoading) {
    return <GeminiLoadingState message="Loading DevQuest..." />;
  }

  if (!session) {
    return <AuthPage />;
  }

  if (!hasGeminiKey) {
    return <ApiKeySetupPage />;
  }

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
