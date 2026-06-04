import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import confetti from 'canvas-confetti';

import { useGameState } from '@/context/GameStateContext';
import { getNode } from '@/config/paths';
import { XP_REWARDS, SP_REWARDS } from '@/config/levels';
import {
  generateLesson,
  generateCodingLab,
  generatePracticeSession,
} from '@/services/geminiService';
import { playCorrect, playWrong, playLevelUp, playCoins } from '@/services/soundService';
import GeminiLoadingState from '@/components/GeminiLoadingState';
import GeminiErrorCard from '@/components/GeminiErrorCard';
import type { CheatSheetSession, CodingLab, AddXpResult, CompleteNodeResult } from '@/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type ModalView = 'loading' | 'error' | 'lesson' | 'quiz' | 'lab' | 'victory';
type AnswerState = 'idle' | 'correct' | 'wrong';

interface QuizState {
  index: number;
  selected: number | null;
  answered: AnswerState;
  wrongCount: number; // total wrong answers this session
}

interface VictoryData {
  xpGained: number;
  spGained: number;
  xpResult: AddXpResult;
  nodeResult: CompleteNodeResult | null;
  isPerfect: boolean;
}

// ─────────────────────────────────────────────────────────────
// Markdown renderer with syntax highlighting
// ─────────────────────────────────────────────────────────────

const mdComponents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={match[1]}
        PreTag="div"
        customStyle={{ borderRadius: '0.75rem', fontSize: '0.85rem', margin: '1rem 0' }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className="inline-code" {...props}>
        {children}
      </code>
    );
  },
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function CheatSheetView({
  session,
  onStartQuiz,
  onOpenLab,
}: {
  session: CheatSheetSession;
  onStartQuiz: () => void;
  onOpenLab: () => void;
}) {
  return (
    <div className="modal-content">
      <div className="modal-prose">
        <ReactMarkdown components={mdComponents}>{session.cheatSheet}</ReactMarkdown>
      </div>
      <div className="modal-actions">
        <button id="open-lab-btn" className="btn btn-ghost" onClick={onOpenLab}>
          🧪 Coding Lab
        </button>
        <button id="start-quiz-btn" className="btn btn-primary btn-3d" onClick={onStartQuiz}>
          Start Quizzes →
        </button>
      </div>
    </div>
  );
}

function QuizView({
  session,
  quizState,
  onSelect,
  onCheck,
  onContinue,
}: {
  session: CheatSheetSession;
  quizState: QuizState;
  onSelect: (idx: number) => void;
  onCheck: () => void;
  onContinue: () => void;
}) {
  const quiz = session.quizzes[quizState.index];
  const total = session.quizzes.length;

  return (
    <div className="modal-content">
      {/* Progress bar */}
      <div className="quiz-progress" role="progressbar" aria-valuenow={quizState.index + 1} aria-valuemax={total}>
        <div className="quiz-progress__track">
          <div
            className="quiz-progress__fill"
            style={{ width: `${((quizState.index) / total) * 100}%` }}
          />
        </div>
        <span className="quiz-progress__label">{quizState.index + 1} / {total}</span>
      </div>

      {/* Question */}
      <p className="quiz-question">{quiz.question}</p>

      {/* Options */}
      <div className="quiz-options">
        {quiz.options.map((opt, i) => {
          let cls = 'quiz-option';
          if (quizState.selected === i) {
            if (quizState.answered === 'correct') cls += ' quiz-option--correct';
            else if (quizState.answered === 'wrong') cls += ' quiz-option--wrong';
            else cls += ' quiz-option--selected';
          } else if (quizState.answered !== 'idle' && i === quiz.correctIndex) {
            cls += ' quiz-option--correct';
          }
          return (
            <button
              key={i}
              id={`quiz-option-${i}`}
              className={cls}
              onClick={() => quizState.answered === 'idle' && onSelect(i)}
              disabled={quizState.answered !== 'idle' && quizState.selected !== i && i !== quiz.correctIndex}
            >
              <span className="quiz-option__letter">{['A', 'B', 'C', 'D'][i]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {quizState.answered !== 'idle' && (
        <div className={`quiz-explanation quiz-explanation--${quizState.answered}`}>
          <span>{quizState.answered === 'correct' ? '✅' : '❌'}</span>
          <p>{quiz.explanation}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="modal-actions">
        {quizState.answered === 'idle' ? (
          <button
            id="check-answer-btn"
            className="btn btn-primary btn-3d"
            disabled={quizState.selected === null}
            onClick={onCheck}
          >
            Check Answer
          </button>
        ) : (
          <button id="continue-btn" className="btn btn-primary btn-3d" onClick={onContinue}>
            {quizState.index < total - 1 ? 'Continue →' : 'See Results →'}
          </button>
        )}
      </div>
    </div>
  );
}

function CodingLabView({
  nodeId,
  apiKey,
  model,
  geminiTopic,
  onComplete,
  onBack,
}: {
  nodeId: string;
  apiKey: string;
  model: string;
  geminiTopic: string;
  onComplete: () => void;
  onBack: () => void;
}) {
  const { completeLab } = useGameState();
  const [lab, setLab] = useState<CodingLab | null>(null);
  const [labError, setLabError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'instructions' | 'boilerplate' | 'tests'>('instructions');
  const [copied, setCopied] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    generateCodingLab(geminiTopic, apiKey, model)
      .then(setLab)
      .catch(setLabError)
      .finally(() => setLoading(false));
  }, [geminiTopic, apiKey, model]);

  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const downloadFiles = useCallback(() => {
    if (!lab) return;
    const files = [
      { name: lab.fileName, content: lab.boilerplateCode },
      { name: `test_${lab.fileName}`, content: lab.testCode },
    ];
    files.forEach(({ name, content }) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }, [lab]);

  const handleComplete = useCallback(() => {
    completeLab(nodeId);
    playCoins();
    onComplete();
  }, [completeLab, nodeId, onComplete]);

  if (loading) return <GeminiLoadingState message="Generating your coding lab..." />;
  if (labError || !lab) {
    return (
      <GeminiErrorCard
        error={labError}
        onRetry={() => {
          setLabError(null);
          setLoading(true);
          loadedRef.current = false;
        }}
      />
    );
  }

  const tabContent = {
    instructions: lab.instructions,
    boilerplate: lab.boilerplateCode,
    tests: lab.testCode,
  };

  const currentContent = activeTab === 'instructions'
    ? tabContent.instructions
    : activeTab === 'boilerplate'
    ? tabContent.boilerplate
    : tabContent.tests;

  return (
    <div className="modal-content">
      <div className="lab-tabs">
        {(['instructions', 'boilerplate', 'tests'] as const).map((t) => (
          <button
            key={t}
            id={`lab-tab-${t}`}
            className={`lab-tab ${activeTab === t ? 'lab-tab--active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t === 'instructions' ? '📋 Instructions' : t === 'boilerplate' ? '💻 Starter Code' : '🧪 Tests'}
          </button>
        ))}
      </div>

      <div className="lab-content">
        {activeTab === 'instructions' ? (
          <div className="modal-prose">
            <ReactMarkdown components={mdComponents}>{lab.instructions}</ReactMarkdown>
          </div>
        ) : (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={lab.language || (lab.fileName.endsWith('.py') ? 'python' : lab.fileName.endsWith('.ts') ? 'typescript' : 'javascript')}
            customStyle={{ borderRadius: '0.75rem', fontSize: '0.82rem', margin: 0, maxHeight: '50vh', overflowY: 'auto' }}
          >
            {currentContent}
          </SyntaxHighlighter>
        )}
      </div>

      <div className="lab-toolbar">
        <button id="copy-lab-btn" className="btn btn-ghost btn-sm" onClick={() => copy(currentContent)}>
          {copied ? '✅ Copied!' : '📋 Copy'}
        </button>
        <button id="download-lab-btn" className="btn btn-ghost btn-sm" onClick={downloadFiles}>
          ⬇️ Download Files
        </button>
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back to Lesson</button>
        <button
          id="complete-lab-btn"
          className="btn btn-success btn-3d"
          onClick={handleComplete}
        >
          ✅ Mark Complete +500 XP
        </button>
      </div>
    </div>
  );
}

function VictoryView({
  victory,
  nodeTitle,
  onClose,
}: {
  victory: VictoryData;
  nodeTitle: string;
  onClose: () => void;
}) {
  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    if (victory.xpResult.leveledUp) playLevelUp();
    else playCoins();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="modal-content victory-screen">
      <div className="victory-emoji" aria-hidden="true">🏆</div>
      <h2 className="victory-title">Lesson Complete!</h2>
      <p className="victory-node">{nodeTitle}</p>

      <div className="victory-rewards">
        <div className="reward-chip reward-chip--xp">
          <span>⚡ +{victory.xpGained} XP</span>
        </div>
        <div className="reward-chip reward-chip--sp">
          <span>💰 +{victory.spGained} SP</span>
        </div>
        {victory.isPerfect && (
          <div className="reward-chip reward-chip--perfect">
            <span>⭐ Perfect!</span>
          </div>
        )}
      </div>

      {victory.xpResult.leveledUp && (
        <div className="victory-levelup">
          🎉 Level Up! You&apos;re now Level {victory.xpResult.newLevel}
          {victory.xpResult.tierChanged && ` — Avatar evolved to Tier ${victory.xpResult.newTier}!`}
        </div>
      )}

      {victory.xpResult.companionEvolved && (
        <div className="victory-companion">
          🐣 Your companion evolved!
        </div>
      )}

      {victory.nodeResult && victory.nodeResult.newlyUnlockedGear.length > 0 && (
        <div className="victory-gear">
          🎒 New gear unlocked: {victory.nodeResult.newlyUnlockedGear.join(', ')}
        </div>
      )}

      <button id="back-to-map-btn" className="btn btn-primary btn-3d" onClick={onClose}>
        Back to Skill Tree →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main SessionModal
// ─────────────────────────────────────────────────────────────

interface SessionModalProps {
  nodeId: string;
  pathId: string;
  onClose: () => void;
  practiceMode?: boolean;   // no completeNode, no lab, 3 quizzes
  recoveryMode?: boolean;   // practiceMode + gainLife on success
}

export default function SessionModal({
  nodeId,
  pathId: _pathId,
  onClose,
  practiceMode = false,
  recoveryMode = false,
}: SessionModalProps) {
  const {
    geminiApiKey,
    selectedModel,
    completedNodes,
    addXp,
    addStudyPoints,
    loseLife,
    gainLife,
    completeNode,
    incrementPerfectLessons,
    incrementLifeRecoveries,
  } = useGameState();

  const node = getNode(nodeId);
  const alreadyCompleted = completedNodes.includes(nodeId);

  const [view, setView] = useState<ModalView>('loading');
  const [session, setSession] = useState<CheatSheetSession | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    index: 0,
    selected: null,
    answered: 'idle',
    wrongCount: 0,
  });
  const [victory, setVictory] = useState<VictoryData | null>(null);
  const loadedRef = useRef(false);

  // Load lesson on mount
  useEffect(() => {
    if (loadedRef.current || !node) return;
    loadedRef.current = true;

    const loader = practiceMode || recoveryMode
      ? generatePracticeSession(node.geminiTopic, geminiApiKey, selectedModel)
      : generateLesson(node.geminiTopic, geminiApiKey, selectedModel);

    loader
      .then((s) => {
        setSession(s);
        setView('lesson');
      })
      .catch((err: Error) => {
        setError(err);
        setView('error');
      });
  }, [node, geminiApiKey, selectedModel, practiceMode, recoveryMode]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setView('loading');
    loadedRef.current = false;
  }, []);

  const handleStartQuiz = useCallback(() => {
    setQuizState({ index: 0, selected: null, answered: 'idle', wrongCount: 0 });
    setView('quiz');
  }, []);

  const handleSelect = useCallback((idx: number) => {
    setQuizState((s) => ({ ...s, selected: idx }));
  }, []);

  const handleCheck = useCallback(() => {
    if (!session) return;
    const quiz = session.quizzes[quizState.index];
    const correct = quizState.selected === quiz.correctIndex;

    if (correct) {
      playCorrect();
      setQuizState((s) => ({ ...s, answered: 'correct' }));
    } else {
      playWrong();
      loseLife();
      setQuizState((s) => ({ ...s, answered: 'wrong', wrongCount: s.wrongCount + 1 }));
    }
  }, [session, quizState.index, quizState.selected, loseLife]);

  const handleContinue = useCallback(() => {
    if (!session) return;
    const isLast = quizState.index >= session.quizzes.length - 1;

    if (isLast) {
      // Calculate rewards
      const baseXp = node
        ? XP_REWARDS.LESSON_COMPLETE + node.estimatedMinutes * 3
        : XP_REWARDS.LESSON_COMPLETE;
      const baseSp = node
        ? SP_REWARDS.LESSON_COMPLETE + node.estimatedMinutes
        : SP_REWARDS.LESSON_COMPLETE;
      const wrongPenalty = Math.min(quizState.wrongCount * 0.1, 0.4);
      const xpGained = Math.round(baseXp * (1 - wrongPenalty));
      const spGained = Math.round(baseSp * (1 - wrongPenalty));
      const isPerfect = quizState.wrongCount === 0;

      // Apply to context
      const xpResult = addXp(xpGained);
      addStudyPoints(spGained);
      let nodeResult: CompleteNodeResult | null = null;
      if (!practiceMode && !recoveryMode && !alreadyCompleted) {
        nodeResult = completeNode(nodeId);
      }
      if (isPerfect) incrementPerfectLessons();
      if (recoveryMode) {
        gainLife();
        incrementLifeRecoveries();
      }

      setVictory({ xpGained, spGained, xpResult, nodeResult, isPerfect });
      setView('victory');
    } else {
      setQuizState((s) => ({
        ...s,
        index: s.index + 1,
        selected: null,
        answered: 'idle',
      }));
    }
  }, [session, quizState, node, addXp, addStudyPoints, completeNode, nodeId, practiceMode, recoveryMode, alreadyCompleted, incrementPerfectLessons, gainLife, incrementLifeRecoveries]);

  const handleLabComplete = useCallback(() => {
    const xpGained = XP_REWARDS.CODING_LAB_COMPLETE;
    const spGained = SP_REWARDS.CODING_LAB_COMPLETE;
    const xpResult = addXp(xpGained);
    addStudyPoints(spGained);
    setVictory({ xpGained, spGained, xpResult, nodeResult: null, isPerfect: false });
    setView('victory');
  }, [addXp, addStudyPoints]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!node) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={node.title}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__left">
            <span className="modal-node-icon">{node.icon}</span>
            <div>
              <h2 className="modal-title">{session?.title ?? node.title}</h2>
              <span className="modal-subtitle">~{node.estimatedMinutes} min</span>
            </div>
          </div>
          <button
            id="modal-close-btn"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {view === 'loading' && <GeminiLoadingState message="Generating your lesson..." />}

          {view === 'error' && (
            <GeminiErrorCard error={error} onRetry={retry} />
          )}

          {view === 'lesson' && session && (
            <CheatSheetView
              session={session}
              onStartQuiz={handleStartQuiz}
              onOpenLab={() => setView('lab')}
            />
          )}

          {view === 'quiz' && session && (
            <QuizView
              session={session}
              quizState={quizState}
              onSelect={handleSelect}
              onCheck={handleCheck}
              onContinue={handleContinue}
            />
          )}

          {view === 'lab' && (
            <CodingLabView
              nodeId={nodeId}
              apiKey={geminiApiKey}
              model={selectedModel}
              geminiTopic={node.geminiTopic}
              onComplete={handleLabComplete}
              onBack={() => setView('lesson')}
            />
          )}

          {view === 'victory' && victory && (
            <VictoryView
              victory={victory}
              nodeTitle={node.title}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
