// ============================================================
// DevQuest — Practice Arena (Milestone 5)
// ============================================================
// Free-form practice: user types any topic → Gemini generates
// a 3-quiz session and awards XP/SP.
// Also hosts the life recovery flow (5.2): picks a random
// completed node, runs a perfect-required quiz session.
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { useGameState } from '@/context/GameStateContext';
import { LEARNING_PATHS, getNode } from '@/config/paths';
import SessionModal from '@/components/SessionModal';

document.title = 'Practice Arena — DevQuest';

// ── Suggested topics pool ─────────────────────────────────────
const TOPIC_POOL = [
  "Explain JavaScript's event loop and how async/await works under the hood",
  "What is the difference between SQL and NoSQL databases? When to use each?",
  "How does Docker containerization work? Containers vs VMs",
  "Explain the CAP theorem and what it means for distributed systems",
  "Walk me through Big-O notation — time and space complexity",
  "How does OAuth 2.0 authentication flow work step by step?",
  "What is the difference between REST and GraphQL APIs?",
  "Explain CSS flexbox and grid — how do I choose between them?",
  "How does React's reconciliation algorithm (the virtual DOM diff) work?",
  "What are microservices and when should you use them over a monolith?",
  "Explain TCP vs UDP — key differences and when to use each",
  "What is a binary search tree? How do inserts, lookups, and deletions work?",
  "How does DNS resolution work end to end?",
  "Explain SOLID principles with practical examples",
  "How do WebSockets differ from HTTP polling and long-polling?",
  "What is eventual consistency and how does it differ from strong consistency?",
  "Explain database indexing — how do B-tree indexes work?",
  "What is memoization and when should you apply it?",
  "Explain HTTP/2 improvements over HTTP/1.1",
  "What are the key differences between process and thread?",
];

function getRandomTopics(n: number): string[] {
  return [...TOPIC_POOL].sort(() => Math.random() - 0.5).slice(0, n);
}

// ── Recovery node selector ────────────────────────────────────
function findRecoveryNodeId(completedNodes: string[]): string | null {
  if (completedNodes.length === 0) return null;

  // Find the path the user has engaged with most (most completed nodes)
  let bestPathId = '';
  let bestCount = 0;
  for (const path of LEARNING_PATHS) {
    const count = path.nodes.filter((n) => completedNodes.includes(n.id)).length;
    if (count > bestCount) {
      bestCount = count;
      bestPathId = path.id;
    }
  }

  let candidates: string[] = [];
  if (bestPathId) {
    const path = LEARNING_PATHS.find((p) => p.id === bestPathId)!;
    candidates = path.nodes
      .filter((n) => completedNodes.includes(n.id))
      .map((n) => n.id);
  }
  if (candidates.length === 0) candidates = [...completedNodes];

  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── Lives display helper ──────────────────────────────────────
function LivesRow({ lives, max = 5 }: { lives: number; max?: number }) {
  return (
    <span className="lives-row" aria-label={`${lives} of ${max} lives`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < lives ? 'heart heart--full' : 'heart heart--empty'}>
          {i < lives ? '❤️' : '🖤'}
        </span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────

export default function PracticePage() {
  document.title = 'Practice Arena — DevQuest';

  const { lives, completedNodes } = useGameState();

  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState('');

  // Modal state — shared between practice and recovery flows
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<{
    nodeId?: string;
    practiceQuestion?: string;
    practiceMode: boolean;
    recoveryMode: boolean;
  } | null>(null);

  const suggestions = useMemo(() => getRandomTopics(6), []);
  const hasCompletedNodes = completedNodes.length > 0;

  // ── Start free-form practice ─────────────────────────────────
  const handleStartPractice = useCallback(() => {
    if (!input.trim()) {
      setInputError('Please enter a topic or question first.');
      return;
    }
    setInputError('');
    setModalProps({
      practiceQuestion: input.trim(),
      practiceMode: true,
      recoveryMode: false,
    });
    setModalOpen(true);
  }, [input]);

  // ── Start life recovery ───────────────────────────────────────
  const handleStartRecovery = useCallback(() => {
    const nodeId = findRecoveryNodeId(completedNodes);
    if (!nodeId) return;
    setModalProps({
      nodeId,
      recoveryMode: true,
      practiceMode: false,
    });
    setModalOpen(true);
  }, [completedNodes]);

  // ── Retry recovery with a different topic ─────────────────────
  const handleRetryRecovery = useCallback(() => {
    // Close current modal momentarily then reopen with a new random node
    setModalOpen(false);
    setTimeout(() => {
      const nodeId = findRecoveryNodeId(completedNodes);
      if (!nodeId) return;
      setModalProps({
        nodeId,
        recoveryMode: true,
        practiceMode: false,
      });
      setModalOpen(true);
    }, 100);
  }, [completedNodes]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalProps(null);
  }, []);

  // ── Get recovery node title for UI ────────────────────────────
  const getRecoveryLabel = () => {
    if (!hasCompletedNodes) return null;
    const nodeId = findRecoveryNodeId(completedNodes);
    if (!nodeId) return null;
    const node = getNode(nodeId);
    return node?.title ?? null;
  };

  return (
    <div className="page practice-page">

      {/* ── Recovery banners ───────────────────────────────── */}
      {lives === 0 ? (
        <div className="recovery-banner recovery-banner--empty" role="alert">
          <div className="recovery-banner__info">
            <span className="recovery-banner__icon">💔</span>
            <div>
              <strong>You&apos;re out of lives!</strong>
              <p>Complete a perfect review to return to the Skill Tree.</p>
            </div>
          </div>
          {hasCompletedNodes ? (
            <button
              id="recover-life-empty-btn"
              className="btn btn-primary btn-3d"
              onClick={handleStartRecovery}
            >
              Recover a Life
            </button>
          ) : (
            <p className="recovery-banner__hint">
              Complete lessons on the Skill Tree first to unlock recovery.
            </p>
          )}
        </div>
      ) : lives < 5 ? (
        <div className="recovery-banner recovery-banner--partial">
          <div className="recovery-banner__info">
            <LivesRow lives={lives} />
            <span className="recovery-banner__label">Review a lesson to recover a life</span>
          </div>
          {hasCompletedNodes && (
            <button
              id="recover-life-partial-btn"
              className="btn btn-ghost btn-sm"
              onClick={handleStartRecovery}
            >
              ❤️ Recover
            </button>
          )}
        </div>
      ) : (
        <div className="practice-full-lives">
          <LivesRow lives={5} />
          <span>Full lives — keep it up!</span>
        </div>
      )}

      {/* ── Page header ────────────────────────────────────── */}
      <div className="practice-header">
        <h1 className="practice-title">Practice Arena</h1>
        <p className="practice-subtitle">Ask anything. Learn something. Earn XP.</p>
      </div>

      {/* ── Question input ─────────────────────────────────── */}
      <div className="card practice-input-card">
        <label htmlFor="practice-input" className="practice-label">
          What do you want to learn today?
        </label>
        <textarea
          id="practice-input"
          className={`practice-textarea${inputError ? ' practice-textarea--error' : ''}`}
          placeholder="e.g. Explain how React's useEffect cleanup works..."
          value={input}
          rows={3}
          onChange={(e) => {
            setInput(e.target.value);
            if (inputError) setInputError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleStartPractice();
          }}
        />
        {inputError && (
          <p className="practice-error" role="alert">{inputError}</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            id="generate-lesson-btn"
            className="btn btn-primary btn-3d"
            onClick={handleStartPractice}
          >
            ⚔️ Generate Lesson →
          </button>
        </div>
      </div>

      {/* ── Suggestions ────────────────────────────────────── */}
      <div className="practice-suggestions">
        <p className="practice-suggestions-label">💡 Quick picks — tap to fill:</p>
        <div className="suggestions-grid">
          {suggestions.map((s, i) => (
            <button
              key={i}
              id={`suggestion-${i}`}
              className={`suggestion-chip${input === s ? ' suggestion-chip--active' : ''}`}
              onClick={() => {
                setInput(s);
                setInputError('');
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Recovery section (below fold) ──────────────────── */}
      {hasCompletedNodes && lives > 0 && lives < 5 && (
        <div className="card practice-recovery-card">
          <div className="practice-recovery-card__content">
            <span className="practice-recovery-card__icon">🔄</span>
            <div>
              <strong>Recover a lost life</strong>
              <p>
                Ace a quick 3-question review on a topic you&apos;ve already studied.
                {getRecoveryLabel() && (
                  <> Topic: <em>{getRecoveryLabel()}</em></>
                )}
              </p>
            </div>
          </div>
          <button
            id="recover-life-card-btn"
            className="btn btn-ghost"
            onClick={handleStartRecovery}
          >
            Start Review →
          </button>
        </div>
      )}

      {/* ── Session Modal ───────────────────────────────────── */}
      {modalOpen && modalProps && (
        <SessionModal
          nodeId={modalProps.nodeId}
          practiceQuestion={modalProps.practiceQuestion}
          pathId=""
          onClose={closeModal}
          practiceMode={modalProps.practiceMode}
          recoveryMode={modalProps.recoveryMode}
          onRetryRecovery={modalProps.recoveryMode ? handleRetryRecovery : undefined}
        />
      )}
    </div>
  );
}
