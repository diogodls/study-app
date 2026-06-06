import { useCallback, useState } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import { useGameState } from '@/context/GameStateContext';
import { useAuth } from '@/context/AuthContext';
import type { GeminiModel } from '@/types';

export default function SettingsPage() {
  const {
    selectedModel,
    soundEnabled,
    setModel,
    setSoundEnabledState,
    resetAll,
  } = useGameState();
  const { user, signOut, deleteGeminiKey } = useAuth();
  const [resetStep, setResetStep] = useState<0 | 1>(0);

  document.title = 'Settings - DevQuest';

  const handleReset = useCallback(() => {
    if (resetStep === 0) {
      setResetStep(1);
    } else {
      resetAll();
      setResetStep(0);
    }
  }, [resetStep, resetAll]);

  return (
    <div className="page stagger-children">
      <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.75rem', fontSize: '1.5rem' }}>
        Settings
      </h1>

      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          DevQuest AI
        </h2>
        <div className="badge badge-success" style={{ marginBottom: '0.75rem' }}>
          Personal Gemini key connected
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
          Your key is encrypted in the backend and never stored in this browser or APK.
        </p>
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginTop: '0.875rem' }}
          onClick={deleteGeminiKey}
        >
          <KeyRound size={14} /> Replace Gemini key
        </button>
      </section>

      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          AI Model
        </h2>

        {(
          [
            { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash Preview', badge: 'Default', desc: 'Latest fast model for daily lessons' },
            { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'Fast', desc: 'Stable fast fallback' },
            { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', badge: 'Smart', desc: 'Higher quality lessons, slower generation' },
          ] as { id: GeminiModel; label: string; badge: string; desc: string }[]
        ).map(({ id, label, badge, desc }) => (
          <button
            key={id}
            id={`model-${id}-btn`}
            onClick={() => setModel(id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.875rem 1rem',
              marginBottom: '0.5rem',
              background: selectedModel === id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
              border: `2px solid ${selectedModel === id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'border-color var(--transition-fast), background var(--transition-fast)',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text)', marginBottom: '0.2rem' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
              <span className={`badge ${selectedModel === id ? 'badge-accent' : 'badge-muted'}`}>{badge}</span>
              {selectedModel === id && <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Active</span>}
            </div>
          </button>
        ))}
      </section>

      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Sound
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Sound Effects</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Quiz feedback, level-up fanfare, coin sounds
            </p>
          </div>
          <input
            id="sound-toggle"
            type="checkbox"
            className="toggle"
            checked={soundEnabled}
            onChange={(event) => setSoundEnabledState(event.target.checked)}
            aria-label="Toggle sound effects"
          />
        </div>
      </section>

      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Account
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          Signed in as {user?.email ?? 'your DevQuest account'}.
        </p>
        <button id="sign-out-btn" className="btn btn-secondary btn-sm" onClick={signOut}>
          <LogOut size={14} /> Sign out
        </button>
      </section>

      <section
        className="card"
        style={{
          borderColor: resetStep === 1 ? 'var(--error)' : 'var(--border)',
          background: resetStep === 1 ? 'var(--error-bg)' : 'var(--bg-card)',
          marginBottom: '2rem',
          transition: 'border-color var(--transition-normal), background var(--transition-normal)',
        }}
      >
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          Danger Zone
        </h2>

        {resetStep === 1 && (
          <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.875rem', lineHeight: 1.5 }}>
            <strong>This will permanently delete your cloud progress.</strong> This cannot be undone.
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            id={resetStep === 0 ? 'reset-data-btn' : 'confirm-reset-btn'}
            className={`btn btn-sm ${resetStep === 1 ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleReset}
          >
            {resetStep === 0 ? 'Reset All Data' : 'Yes, Delete Everything'}
          </button>
          {resetStep === 1 && (
            <button
              id="cancel-reset-btn"
              className="btn btn-secondary btn-sm"
              onClick={() => setResetStep(0)}
            >
              Cancel
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
