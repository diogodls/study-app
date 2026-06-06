import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import confetti from 'canvas-confetti';

import { useGameState } from '@/context/GameStateContext';
import { getNode } from '@/config/paths';
import { XP_REWARDS, SP_REWARDS } from '@/config/levels';
import { getCompanionSpeciesStageLabel, getGearItem } from '@/config/character';
import {
  generateLesson,
  generateCodingLab,
  generatePracticeSession,
} from '@/services/geminiService';
import { playCorrect, playWrong, playLevelUp, playCoins } from '@/services/soundService';
import { getCachedContent, saveCachedContent } from '@/services/contentCacheService';
import GeminiLoadingState from '@/components/GeminiLoadingState';
import GeminiErrorCard from '@/components/GeminiErrorCard';
import { AvatarSprite, CompanionDisplay } from '@/components/PixelSprites';
import ContentNotes from '@/components/ContentNotes';
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
  lifeRecovered: boolean;
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
  noteContextId,
  onStartQuiz,
  onOpenLab,
  showLab = true,
}: {
  session: CheatSheetSession;
  noteContextId: string;
  onStartQuiz: () => void;
  onOpenLab: () => void;
  showLab?: boolean;
}) {
  return (
    <div className="modal-content">
      <div className="modal-prose">
        <ReactMarkdown components={mdComponents}>{session.cheatSheet}</ReactMarkdown>
      </div>
      <ContentNotes contextId={noteContextId} contentType="lesson" />
      <div className="modal-actions">
        <button id="open-lab-btn" className="btn btn-ghost" onClick={onOpenLab} hidden={!showLab}>
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
  contextId,
  completionNodeId,
  apiKey,
  model,
  geminiTopic,
  onComplete,
  onBack,
}: {
  contextId: string;
  completionNodeId?: string;
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
    getCachedContent<CodingLab>(contextId, 'lab', model)
      .then(async (cached) => {
        if (cached) return cached;
        const generated = await generateCodingLab(geminiTopic, apiKey, model);
        await saveCachedContent(contextId, 'lab', model, generated);
        return generated;
      })
      .then(setLab)
      .catch(setLabError)
      .finally(() => setLoading(false));
  }, [contextId, geminiTopic, apiKey, model]);

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
    if (completionNodeId) completeLab(completionNodeId);
    playCoins();
    onComplete();
  }, [completeLab, completionNodeId, onComplete]);

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

      <ContentNotes contextId={contextId} contentType="lab" />

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

function LegacyVictoryView({
  victory,
  nodeTitle,
  onClose,
  onRetryRecovery,
}: {
  victory: VictoryData;
  nodeTitle: string;
  onClose: () => void;
  onRetryRecovery?: () => void;
}) {
  useEffect(() => {
    if (victory.lifeRecovered || victory.xpResult.leveledUp) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } else {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 }, colors: ['#9B97B0'] });
    }
    if (victory.xpResult.leveledUp) playLevelUp();
    else playCoins();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isFailedRecovery = onRetryRecovery && !victory.lifeRecovered;

  return (
    <div className="modal-content victory-screen">
      <div className="victory-emoji" aria-hidden="true">
        {victory.lifeRecovered ? '❤️' : isFailedRecovery ? '💔' : '🏆'}
      </div>
      <h2 className="victory-title">
        {victory.lifeRecovered
          ? 'Life Recovered!'
          : isFailedRecovery
          ? 'No life recovered'
          : 'Session Complete!'}
      </h2>
      <p className="victory-node">{nodeTitle}</p>

      {isFailedRecovery ? (
        <div className="recovery-fail-msg">
          You had wrong answers — a perfect run is required to recover a life. Try a different topic!
        </div>
      ) : (
        <div className="victory-rewards">
          <div className="reward-chip reward-chip--xp">
            <span>⚡ +{victory.xpGained} XP</span>
          </div>
          <div className="reward-chip reward-chip--sp">
            <span>💰 +{victory.spGained} SP</span>
          </div>
          {victory.lifeRecovered && (
            <div className="reward-chip reward-chip--life">
              <span>❤️ +1 Life</span>
            </div>
          )}
          {victory.isPerfect && !victory.lifeRecovered && (
            <div className="reward-chip reward-chip--perfect">
              <span>⭐ Perfect!</span>
            </div>
          )}
        </div>
      )}

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

      <div className="modal-actions" style={{ justifyContent: 'center' }}>
        {isFailedRecovery && (
          <button id="retry-recovery-btn" className="btn btn-ghost" onClick={onRetryRecovery}>
            Try a different topic
          </button>
        )}
        <button id="back-to-map-btn" className="btn btn-primary btn-3d" onClick={onClose}>
          {onRetryRecovery ? 'Close' : 'Back to Skill Tree →'}
        </button>
      </div>
    </div>
  );
}

void LegacyVictoryView;

function VictoryView({
  victory,
  nodeTitle,
  onClose,
  onRetryRecovery,
}: {
  victory: VictoryData;
  nodeTitle: string;
  onClose: () => void;
  onRetryRecovery?: () => void;
}) {
  const { avatarId, equippedItems, companion, streak } = useGameState();

  useEffect(() => {
    if (victory.lifeRecovered || victory.xpResult.leveledUp) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    } else {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 }, colors: ['#9B97B0'] });
    }
    if (victory.xpResult.leveledUp) playLevelUp();
    else playCoins();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isFailedRecovery = onRetryRecovery && !victory.lifeRecovered;
  const unlockedGear = victory.nodeResult?.newlyUnlockedGear
    .map((id) => getGearItem(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? [];

  return (
    <div className="modal-content victory-screen">
      <div className="victory-emoji" aria-hidden="true">
        {victory.lifeRecovered ? '♥' : isFailedRecovery ? '×' : '🏆'}
      </div>
      <h2 className="victory-title">
        {victory.lifeRecovered ? 'Life Recovered!' : isFailedRecovery ? 'No life recovered' : 'Session Complete!'}
      </h2>
      <p className="victory-node">{nodeTitle}</p>

      {isFailedRecovery ? (
        <div className="recovery-fail-msg">
          You had wrong answers. A perfect run is required to recover a life. Try a different topic!
        </div>
      ) : (
        <div className="victory-rewards">
          <div className="reward-chip reward-chip--xp"><span>⚡ +{victory.xpGained} XP</span></div>
          <div className="reward-chip reward-chip--sp"><span>💰 +{victory.spGained} SP</span></div>
          {victory.lifeRecovered && <div className="reward-chip reward-chip--life"><span>♥ +1 Life</span></div>}
          {victory.isPerfect && !victory.lifeRecovered && <div className="reward-chip reward-chip--perfect"><span>★ Perfect!</span></div>}
        </div>
      )}

      {victory.xpResult.leveledUp && (
        <div className="victory-levelup">
          <span>Level Up! You&apos;re now Level {victory.xpResult.newLevel}</span>
          {victory.xpResult.tierChanged && (
            <div className="victory-avatar-flash">
              <AvatarSprite avatarId={avatarId} tier={victory.xpResult.newTier} equippedItems={equippedItems} />
              <strong>Avatar evolved to Tier {victory.xpResult.newTier}</strong>
            </div>
          )}
        </div>
      )}

      {victory.xpResult.companionEvolved && (
        <div className="victory-companion">
          <CompanionDisplay stage={victory.xpResult.newCompanionStage} species={companion.species} name={companion.name} streak={streak} compact />
          <span>Your companion evolved into {getCompanionSpeciesStageLabel(companion.species, victory.xpResult.newCompanionStage)}!</span>
        </div>
      )}

      {unlockedGear.length > 0 && (
        <div className="victory-gear">
          {unlockedGear.map((item) => (
            <div key={item.id} className={`victory-gear-card victory-gear-card--${item.rarity}`}>
              <span className="victory-gear-card__art">{item.emoji}</span>
              <span className="victory-gear-card__name">{item.name}</span>
              <span className="victory-gear-card__flavor">{item.flavorText}</span>
            </div>
          ))}
        </div>
      )}

      <div className="modal-actions" style={{ justifyContent: 'center' }}>
        {isFailedRecovery && (
          <button id="retry-recovery-btn" className="btn btn-ghost" onClick={onRetryRecovery}>
            Try a different topic
          </button>
        )}
        <button id="back-to-map-btn" className="btn btn-primary btn-3d" onClick={onClose}>
          {onRetryRecovery ? 'Close' : 'Back to Skill Tree →'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main SessionModal
// ─────────────────────────────────────────────────────────────

interface SessionModalProps {
  nodeId?: string;           // omit for free-practice sessions
  pathId?: string;
  practiceQuestion?: string; // free-form topic — overrides node.geminiTopic
  onClose: () => void;
  practiceMode?: boolean;    // no completeNode, no lab, 3 quizzes
  recoveryMode?: boolean;    // practiceMode + gainLife only on perfect
  onRetryRecovery?: () => void; // shown on failed recovery
}

export default function SessionModal({
  nodeId,
  practiceQuestion,
  onClose,
  practiceMode = false,
  recoveryMode = false,
  onRetryRecovery,
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

  const node = nodeId ? getNode(nodeId) : null;
  const practiceContextId = practiceQuestion
    ? `arena-${practiceQuestion.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 120)}`
    : null;
  const noteContextId = nodeId ?? practiceContextId ?? 'practice';
  const alreadyCompleted = nodeId ? completedNodes.includes(nodeId) : false;

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
    if (loadedRef.current) return;
    const topic = practiceQuestion ?? node?.geminiTopic;
    if (!topic) return;
    loadedRef.current = true;

    const loader = practiceMode || recoveryMode || !nodeId
      ? generatePracticeSession(topic, geminiApiKey, selectedModel)
      : getCachedContent<CheatSheetSession>(nodeId, 'lesson', selectedModel)
          .then(async (cached) => {
            if (cached) return cached;
            const generated = await generateLesson(topic, geminiApiKey, selectedModel);
            await saveCachedContent(nodeId, 'lesson', selectedModel, generated);
            return generated;
          });

    loader
      .then((s) => {
        setSession(s);
        setView('lesson');
      })
      .catch((err: Error) => {
        setError(err);
        setView('error');
      });
  }, [node, nodeId, practiceQuestion, geminiApiKey, selectedModel, practiceMode, recoveryMode]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.classList.add('session-modal-open');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('session-modal-open');
    };
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
      if (!practiceMode && !recoveryMode && !alreadyCompleted && nodeId) {
        nodeResult = completeNode(nodeId);
      }
      if (isPerfect) incrementPerfectLessons();
      // Recovery: only grant life on a perfect run
      const lifeRecovered = recoveryMode && isPerfect;
      if (lifeRecovered) {
        gainLife();
        incrementLifeRecoveries();
      }

      setVictory({ xpGained, spGained, xpResult, nodeResult, isPerfect, lifeRecovered });
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
    setVictory({ xpGained, spGained, xpResult, nodeResult: null, isPerfect: false, lifeRecovered: false });
    setView('victory');
  }, [addXp, addStudyPoints]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  // Require either a node or a free-form question
  if (!node && !practiceQuestion) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={node?.title ?? session?.title ?? 'Practice Session'}>
      <div className="modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header__left">
            {node && <span className="modal-node-icon">{node.icon}</span>}
            <div>
              <h2 className="modal-title">{session?.title ?? node?.title ?? 'Practice Session'}</h2>
              {node && <span className="modal-subtitle">~{node.estimatedMinutes} min</span>}
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
              noteContextId={noteContextId}
              onStartQuiz={handleStartQuiz}
              onOpenLab={() => setView('lab')}
              showLab={!recoveryMode && Boolean(node?.geminiTopic || practiceQuestion)}
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

          {view === 'lab' && (node?.geminiTopic || practiceQuestion) && (
            <CodingLabView
              contextId={noteContextId}
              completionNodeId={nodeId}
              apiKey={geminiApiKey}
              model={selectedModel}
              geminiTopic={node?.geminiTopic ?? practiceQuestion ?? ''}
              onComplete={handleLabComplete}
              onBack={() => setView('lesson')}
            />
          )}

          {view === 'victory' && victory && (
            <VictoryView
              victory={victory}
              nodeTitle={node?.title ?? session?.title ?? 'Practice Session'}
              onClose={onClose}
              onRetryRecovery={recoveryMode ? onRetryRecovery : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
