import { useCallback, useState } from 'react';
import { Loader } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Mode = 'sign-in' | 'sign-up';

export default function AuthPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  document.title = 'Sign in - DevQuest';

  const submit = useCallback(async () => {
    setError('');
    setMessage('');
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password with at least 6 characters.');
      return;
    }
    if (mode === 'sign-up' && geminiApiKey.trim().length < 20) {
      setError('Enter a valid Gemini API key.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'sign-in') {
        await signInWithEmail(email.trim(), password);
      } else {
        const keySaved = await signUpWithEmail(email.trim(), password, geminiApiKey.trim());
        setGeminiApiKey('');
        setMessage(keySaved
          ? 'Account created and Gemini key saved.'
          : 'Account created. Confirm your email, sign in, then submit your Gemini key.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }, [email, password, geminiApiKey, mode, signInWithEmail, signUpWithEmail]);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <img src="/devquest-icon.svg" alt="" className="auth-logo" />
        <h1>DevQuest</h1>
        <p className="auth-subtitle">Sign in to sync your progress and use DevQuest AI anywhere.</p>

        <div className="auth-tabs" role="tablist">
          <button
            id="auth-sign-in-tab"
            className={mode === 'sign-in' ? 'auth-tab auth-tab--active' : 'auth-tab'}
            onClick={() => setMode('sign-in')}
          >
            Sign in
          </button>
          <button
            id="auth-sign-up-tab"
            className={mode === 'sign-up' ? 'auth-tab auth-tab--active' : 'auth-tab'}
            onClick={() => setMode('sign-up')}
          >
            Create account
          </button>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="auth-email-input">Email</label>
          <input
            id="auth-email-input"
            className="input"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {mode === 'sign-up' && (
          <div className="input-group">
            <label className="input-label" htmlFor="auth-gemini-key-input">Gemini API key</label>
            <input
              id="auth-gemini-key-input"
              className="input"
              type="password"
              value={geminiApiKey}
              autoComplete="off"
              onChange={(event) => setGeminiApiKey(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submit()}
            />
            <small style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Stored encrypted and used only for your AI requests.
            </small>
          </div>
        )}

        <div className="input-group">
          <label className="input-label" htmlFor="auth-password-input">Password</label>
          <input
            id="auth-password-input"
            className="input"
            type="password"
            value={password}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submit()}
          />
        </div>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-message">{message}</p>}

        <button id="auth-submit-btn" className="btn btn-primary btn-3d btn-full" disabled={loading} onClick={submit}>
          {loading ? <><Loader size={16} className="animate-spin" /> Working...</> : mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </button>
      </div>
    </div>
  );
}
