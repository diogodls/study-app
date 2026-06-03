import { useState, useCallback } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useGameState } from '@/context/GameStateContext';
import type { GeminiModel } from '@/types';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

async function testGeminiKey(apiKey: string, model: GeminiModel): Promise<void> {
  if (!apiKey.trim()) throw new Error('No API key provided');
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const instance = genAI.getGenerativeModel({ model });
  const result = await instance.generateContent('Reply with exactly: OK');
  const text = result.response.text().trim();
  if (!text.toLowerCase().includes('ok')) throw new Error('Unexpected response');
}

export default function SettingsPage() {
  const {
    geminiApiKey,
    selectedModel,
    soundEnabled,
    setApiKey,
    setModel,
    setSoundEnabledState,
    resetAll,
  } = useGameState();

  const [keyInput, setKeyInput]       = useState(geminiApiKey);
  const [showKey, setShowKey]         = useState(false);
  const [testStatus, setTestStatus]   = useState<TestStatus>('idle');
  const [testError, setTestError]     = useState('');
  const [resetStep, setResetStep]     = useState<0 | 1>(0);

  // Set page title
  document.title = 'Settings — DevQuest';

  const handleSaveKey = useCallback(() => {
    setApiKey(keyInput.trim());
    setTestStatus('idle');
  }, [keyInput, setApiKey]);

  const handleTestConnection = useCallback(async () => {
    const key = keyInput.trim();
    if (!key) {
      setTestStatus('error');
      setTestError('Enter an API key first.');
      return;
    }
    setTestStatus('loading');
    setTestError('');
    try {
      await testGeminiKey(key, selectedModel);
      setApiKey(key); // auto-save on success
      setTestStatus('success');
    } catch (err) {
      setTestStatus('error');
      setTestError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [keyInput, selectedModel, setApiKey]);

  const handleReset = useCallback(() => {
    if (resetStep === 0) {
      setResetStep(1);
    } else {
      resetAll();
      setKeyInput('');
      setResetStep(0);
      setTestStatus('idle');
    }
  }, [resetStep, resetAll]);

  return (
    <div className="page stagger-children">
      <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.75rem', fontSize: '1.5rem' }}>
        ⚙️ Settings
      </h1>

      {/* ── API Key ──────────────────────────────────────── */}
      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          🔑 Gemini API Key
        </h2>

        <div className="input-group" style={{ marginBottom: '0.75rem' }}>
          <label className="input-label" htmlFor="api-key-input">API Key</label>
          <div style={{ position: 'relative' }}>
            <input
              id="api-key-input"
              className="input"
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={(e) => { setKeyInput(e.target.value); setTestStatus('idle'); }}
              placeholder="AIza..."
              autoComplete="off"
              spellCheck={false}
              style={{ paddingRight: '3rem' }}
            />
            <button
              id="toggle-key-visibility-btn"
              className="btn-ghost btn-icon"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '0.375rem',
              }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Test connection result */}
        {testStatus === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            <CheckCircle size={16} />
            <span>Connection successful! Key saved.</span>
          </div>
        )}
        {testStatus === 'error' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
            <XCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{testError || 'Connection failed. Check your key.'}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            id="test-connection-btn"
            className="btn btn-primary btn-sm"
            onClick={handleTestConnection}
            disabled={testStatus === 'loading' || !keyInput.trim()}
          >
            {testStatus === 'loading'
              ? <><Loader size={14} className="animate-spin" /> Testing...</>
              : '⚡ Test Connection'}
          </button>
          <button
            id="save-api-key-btn"
            className="btn btn-secondary btn-sm"
            onClick={handleSaveKey}
            disabled={keyInput === geminiApiKey}
          >
            Save
          </button>
        </div>

        <p className="input-hint" style={{ marginTop: '0.625rem' }}>
          Get your free key at{' '}
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
            aistudio.google.com
          </a>
        </p>
      </section>

      {/* ── AI Model ─────────────────────────────────────── */}
      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          🤖 AI Model
        </h2>

        {(
          [
            { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', badge: 'Fast', desc: 'Faster responses, ideal for daily practice' },
            { id: 'gemini-2.5-pro',   label: 'Gemini 2.5 Pro',   badge: 'Smart', desc: 'Higher quality lessons, slower generation' },
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
              {selectedModel === id && <span style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>✓ Active</span>}
            </div>
          </button>
        ))}
      </section>

      {/* ── Sound ────────────────────────────────────────── */}
      <section className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
          🔊 Sound
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
            onChange={(e) => setSoundEnabledState(e.target.checked)}
            aria-label="Toggle sound effects"
          />
        </div>
      </section>

      {/* ── Danger Zone ──────────────────────────────────── */}
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
          ⚠️ Danger Zone
        </h2>

        {resetStep === 1 && (
          <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '0.875rem', lineHeight: 1.5 }}>
            <strong>This will permanently delete all your XP, levels, progress, and settings.</strong>{' '}
            This cannot be undone. Are you sure?
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button
            id={resetStep === 0 ? 'reset-data-btn' : 'confirm-reset-btn'}
            className={`btn btn-sm ${resetStep === 1 ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleReset}
          >
            {resetStep === 0 ? '🗑️ Reset All Data' : '✓ Yes, Delete Everything'}
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
