import { useNavigate } from 'react-router-dom';
import { AlertCircle, WifiOff, KeyRound, RefreshCw } from 'lucide-react';

type GeminiErrorCardProps = {
  error: Error | null;
  onRetry: () => void;
};

type ErrorCase = {
  Icon: typeof AlertCircle;
  title: string;
  message: string;
  cta: 'retry' | 'settings';
};

function classifyError(error: Error): ErrorCase {
  const msg = error.message.toLowerCase();

  if (msg.includes('api key') || msg.includes('no api key') || msg.includes('missing key')) {
    return {
      Icon: KeyRound,
      title: 'No API Key',
      message: "You haven't set up a Gemini API key yet. Add it in Settings to start learning.",
      cta: 'settings',
    };
  }

  if (msg.includes('json') || msg.includes('parse') || msg.includes('malformed')) {
    return {
      Icon: AlertCircle,
      title: 'Malformed Response',
      message: "The AI response was in an unexpected format. This usually resolves itself.",
      cta: 'retry',
    };
  }

  // Network / quota / unknown
  return {
    Icon: WifiOff,
    title: 'Couldn\'t Reach Gemini',
    message: "Check your internet connection or API quota. The key might also be invalid.",
    cta: 'retry',
  };
}

export default function GeminiErrorCard({ error, onRetry }: GeminiErrorCardProps) {
  const navigate = useNavigate();

  if (!error) return null;

  const { Icon, title, message, cta } = classifyError(error);

  return (
    <div
      className="card animate-fadeInUp"
      style={{
        borderColor: 'var(--error)',
        background: 'var(--error-bg)',
        margin: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'flex-start',
      }}
      role="alert"
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <Icon
          size={22}
          color="var(--error)"
          style={{ flexShrink: 0, marginTop: '2px' }}
          aria-hidden="true"
        />
        <div>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              color: 'var(--error)',
              marginBottom: '0.3rem',
            }}
          >
            {title}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {message}
          </p>
        </div>
      </div>

      {/* Error detail — collapsed, for debugging */}
      <details style={{ width: '100%' }}>
        <summary style={{ fontSize: '0.75rem', color: 'var(--text-faint)', cursor: 'pointer' }}>
          Error detail
        </summary>
        <code
          style={{
            display: 'block',
            marginTop: '0.375rem',
            fontSize: '0.6875rem',
            color: 'var(--text-faint)',
            fontFamily: 'var(--font-mono)',
            wordBreak: 'break-all',
          }}
        >
          {error.message}
        </code>
      </details>

      {/* CTA button */}
      {cta === 'retry' ? (
        <button
          id="gemini-error-retry-btn"
          className="btn btn-secondary btn-sm"
          onClick={onRetry}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      ) : (
        <button
          id="gemini-error-settings-btn"
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/settings')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <KeyRound size={14} />
          Open Settings
        </button>
      )}
    </div>
  );
}
