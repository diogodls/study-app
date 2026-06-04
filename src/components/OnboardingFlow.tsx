// ============================================================
// DevQuest — Onboarding Flow (Milestone 7.1)
// ============================================================
// 6-step first-launch wizard shown when onboardingComplete === false.
// Steps: Welcome → Avatar → Name → API Key → Path → Companion
// On finish: calls completeOnboarding() and navigates to /.
// ============================================================

import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '@/context/GameStateContext';
import { AVATARS } from '@/config/character';
import { LEARNING_PATHS } from '@/config/paths';
import { generateLesson } from '@/services/geminiService';
import type { AvatarId } from '@/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5 | 6;
const TOTAL_STEPS = 6;

// ─────────────────────────────────────────────────────────────
// Dot progress indicator
// ─────────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: Step; total: number }) {
  return (
    <div className="onboarding-dots" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`onboarding-dot${i + 1 === current ? ' onboarding-dot--active' : i + 1 < current ? ' onboarding-dot--done' : ''}`}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 1 — Welcome
// ─────────────────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="onboarding-step step-welcome">
      <div className="onboarding-logo" aria-hidden="true">⚔️</div>
      <h1 className="onboarding-brand">DevQuest</h1>
      <p className="onboarding-tagline">Level up your code.<br />Every day.</p>
      <p className="onboarding-welcome-body">
        Learn computer science through bite-sized lessons, AI-generated quizzes,
        and a gamified streak system. Your adventure starts here.
      </p>
      <button id="start-quest-btn" className="btn btn-primary btn-3d btn-lg" onClick={onNext}>
        Start your quest →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 2 — Avatar Selection
// ─────────────────────────────────────────────────────────────

function StepAvatar({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: AvatarId | null;
  onSelect: (id: AvatarId) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step-title">Choose your hero</h2>
      <p className="onboarding-step-sub">Pick the character that speaks to your coding style.</p>

      <div className="avatar-grid">
        {AVATARS.map((av) => (
          <button
            key={av.id}
            id={`avatar-${av.id}`}
            className={`avatar-card${selected === av.id ? ' avatar-card--selected' : ''}`}
            onClick={() => onSelect(av.id)}
          >
            <span className="avatar-card__emoji">{av.emoji}</span>
            <span className="avatar-card__name">{av.name}</span>
            <span className="avatar-card__desc">{av.description}</span>
            {selected === av.id && <span className="avatar-card__check">✓</span>}
          </button>
        ))}
      </div>

      <div className="onboarding-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button
          id="avatar-next-btn"
          className="btn btn-primary btn-3d"
          disabled={!selected}
          onClick={onNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 3 — Character Name
// ─────────────────────────────────────────────────────────────

function StepName({
  name,
  onName,
  onNext,
  onBack,
}: {
  name: string;
  onName: (n: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!name.trim()) { setError("Your hero needs a name!"); return; }
    if (name.trim().length < 2) { setError("Must be at least 2 characters."); return; }
    onNext();
  };

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step-title">Name your hero</h2>
      <p className="onboarding-step-sub">This is what the DevQuest world will know you as.</p>

      <div className="onboarding-name-wrap">
        <label htmlFor="hero-name-input" className="onboarding-name-label">Hero name</label>
        <input
          id="hero-name-input"
          className={`onboarding-name-input${error ? ' onboarding-name-input--error' : ''}`}
          type="text"
          placeholder="e.g. ShadowCoder"
          value={name}
          maxLength={20}
          autoFocus
          onChange={(e) => { onName(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
        />
        <div className="onboarding-name-meta">
          {error
            ? <span className="onboarding-name-error">{error}</span>
            : <span className="onboarding-name-hint">Max 20 characters</span>
          }
          <span className="onboarding-name-count">{name.length}/20</span>
        </div>
      </div>

      <div className="onboarding-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button id="name-next-btn" className="btn btn-primary btn-3d" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 4 — API Key (skippable)
// ─────────────────────────────────────────────────────────────

function StepApiKey({
  apiKey,
  onApiKey,
  onNext,
  onSkip,
  onBack,
}: {
  apiKey: string;
  onApiKey: (k: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [testMsg, setTestMsg] = useState('');

  const handleTest = useCallback(async () => {
    if (!apiKey.trim()) { setTestMsg('Enter a key first.'); setTestStatus('fail'); return; }
    setTestStatus('testing');
    try {
      await generateLesson('Say: OK', apiKey.trim(), 'gemini-2.5-flash');
      setTestStatus('ok');
      setTestMsg('✅ Key works!');
    } catch {
      setTestStatus('fail');
      setTestMsg('❌ Invalid key or network error.');
    }
  }, [apiKey]);

  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step-title">Connect your AI</h2>
      <p className="onboarding-step-sub">
        DevQuest uses the Gemini API to generate your lessons. Get a free key at{' '}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="onboarding-link">
          aistudio.google.com
        </a>
      </p>

      <div className="onboarding-apikey-wrap">
        <div className="onboarding-apikey-row">
          <input
            id="onboarding-api-key-input"
            className="onboarding-name-input"
            type={visible ? 'text' : 'password'}
            placeholder="AIza..."
            value={apiKey}
            onChange={(e) => { onApiKey(e.target.value); setTestStatus('idle'); setTestMsg(''); }}
          />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide key' : 'Show key'}
          >
            {visible ? '🙈' : '👁️'}
          </button>
        </div>

        <button
          id="test-api-key-btn"
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: 'flex-start' }}
          disabled={testStatus === 'testing'}
          onClick={handleTest}
        >
          {testStatus === 'testing' ? '⏳ Testing…' : 'Test connection'}
        </button>

        {testMsg && (
          <p className={`onboarding-test-msg onboarding-test-msg--${testStatus}`}>{testMsg}</p>
        )}
      </div>

      <div className="onboarding-note">
        🔒 Your key is stored locally in your browser — never sent to any server other than Google.
      </div>

      <div className="onboarding-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button id="skip-api-key-btn" className="btn btn-ghost" onClick={onSkip}>
          Skip for now
        </button>
        <button
          id="apikey-next-btn"
          className="btn btn-primary btn-3d"
          onClick={onNext}
          disabled={!apiKey.trim()}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 5 — Path Selection
// ─────────────────────────────────────────────────────────────

function StepPath({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="onboarding-step">
      <h2 className="onboarding-step-title">Choose your starting path</h2>
      <p className="onboarding-step-sub">
        You can explore all paths later. This unlocks your first lesson.
      </p>

      <div className="path-selection-grid">
        {LEARNING_PATHS.map((path) => (
          <button
            key={path.id}
            id={`path-select-${path.id}`}
            className={`path-select-card${selected === path.id ? ' path-select-card--selected' : ''}`}
            style={{ '--path-color': path.color } as React.CSSProperties}
            onClick={() => onSelect(path.id)}
          >
            <span className="path-select-card__icon">{path.icon}</span>
            <div className="path-select-card__body">
              <span className="path-select-card__title">{path.title}</span>
              <span className="path-select-card__desc">{path.description}</span>
              <span className="path-select-card__nodes">{path.nodes.length} nodes</span>
            </div>
            {selected === path.id && <span className="path-select-card__check">✓</span>}
          </button>
        ))}
      </div>

      <div className="onboarding-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button
          id="path-next-btn"
          className="btn btn-primary btn-3d"
          disabled={!selected}
          onClick={onNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step 6 — Meet Companion
// ─────────────────────────────────────────────────────────────

function StepCompanion({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  return (
    <div className="onboarding-step step-companion">
      <div className="companion-egg-wrap">
        <span className="companion-egg" aria-hidden="true">🥚</span>
        <div className="companion-egg-glow" />
      </div>
      <h2 className="onboarding-step-title">Meet your companion</h2>
      <p className="onboarding-step-sub">
        Your companion will grow as you learn.<br />
        Study every day to watch it evolve!
      </p>
      <div className="companion-evolution-preview">
        <span title="Egg">🥚</span>
        <span className="evolution-arrow">→</span>
        <span title="Hatchling">🐣</span>
        <span className="evolution-arrow">→</span>
        <span title="Young">🐤</span>
        <span className="evolution-arrow">→</span>
        <span title="Legendary">🦅</span>
      </div>
      <button id="finish-onboarding-btn" className="btn btn-primary btn-3d btn-lg" onClick={onFinish}>
        Let&apos;s go! →
      </button>
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginTop: '0.5rem' }}>
        ← Back
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main OnboardingFlow
// ─────────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const { completeOnboarding } = useGameState();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [avatarId, setAvatarId] = useState<AvatarId | null>(null);
  const [heroName, setHeroName] = useState('');
  const [apiKey, setLocalApiKey] = useState('');
  const [pathId, setPathId] = useState<string | null>(null);

  // Prevent double-submit on finish
  const finishing = useRef(false);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS) as Step), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 1) as Step), []);

  const handleFinish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;

    completeOnboarding({
      avatarId: avatarId ?? 'hooded-coder',
      characterName: heroName.trim() || 'Hero',
      startingPathId: pathId ?? LEARNING_PATHS[0].id,
      geminiApiKey: apiKey.trim() || undefined,
    });

    // Navigate to skill tree with starting path state
    navigate('/', { state: { startingPathId: pathId ?? LEARNING_PATHS[0].id } });
  }, [avatarId, heroName, apiKey, pathId, completeOnboarding, setApiKey, navigate]);

  return (
    <div className="onboarding-shell">
      <StepDots current={step} total={TOTAL_STEPS} />

      <div className="onboarding-card">
        {step === 1 && <StepWelcome onNext={next} />}
        {step === 2 && (
          <StepAvatar
            selected={avatarId}
            onSelect={setAvatarId}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && (
          <StepName
            name={heroName}
            onName={setHeroName}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 4 && (
          <StepApiKey
            apiKey={apiKey}
            onApiKey={setLocalApiKey}
            onNext={next}
            onSkip={next}
            onBack={back}
          />
        )}
        {step === 5 && (
          <StepPath
            selected={pathId}
            onSelect={setPathId}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 6 && (
          <StepCompanion
            onFinish={handleFinish}
            onBack={back}
          />
        )}
      </div>
    </div>
  );
}
