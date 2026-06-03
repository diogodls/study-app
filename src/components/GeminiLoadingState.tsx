type GeminiLoadingStateProps = {
  message?: string;
};

export default function GeminiLoadingState({ message }: GeminiLoadingStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '3rem 1.5rem',
        minHeight: '240px',
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading AI response"
    >
      {/* Spinning orb */}
      <div style={{ position: 'relative', width: '56px', height: '56px' }}>
        <div
          className="animate-spin"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRightColor: 'var(--accent-alt)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.375rem',
          }}
          aria-hidden="true"
        >
          ✨
        </span>
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            color: 'var(--text)',
            fontSize: '1rem',
            marginBottom: '0.375rem',
          }}
        >
          {message ?? 'DevQuest AI is thinking'}
          <span className="loading-ellipsis" aria-hidden="true" />
        </p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-faint)' }}>
          Crafting your lesson with Gemini
        </p>
      </div>

      {/* Skeleton lines hint */}
      <div style={{ width: '100%', maxWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div className="skeleton" style={{ height: '12px', width: '100%' }} />
        <div className="skeleton" style={{ height: '12px', width: '85%' }} />
        <div className="skeleton" style={{ height: '12px', width: '70%' }} />
      </div>
    </div>
  );
}
