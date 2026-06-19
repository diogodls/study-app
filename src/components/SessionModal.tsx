import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import confetti from 'canvas-confetti';

import { useGameState } from '@/context/GameStateContext';
import { getNode, getNodeTopic } from '@/config/paths';
import { getCompanionSpeciesStageLabel, getCosmeticItem, getGearItem } from '@/config/character';
import {
  generateLesson,
  generateCodingLab,
  generateDailyChallenge,
  generatePracticeSession,
  generateMasterSession,
  evaluateTeachBack,
} from '@/services/geminiService';
import { saveQuizResult } from '@/services/quizResultsService';
import { upsertSrsSchedule } from '@/services/srsService';
import { playCorrect, playWrong, playLevelUp, playCoins } from '@/services/soundService';
import { getCachedContent, saveCachedContent } from '@/services/contentCacheService';
import { createActiveTimeTracker, recordStudyEvent } from '@/services/analyticsService';
import GeminiLoadingState from '@/components/GeminiLoadingState';
import GeminiErrorCard from '@/components/GeminiErrorCard';
import { AvatarSprite, CompanionDisplay } from '@/components/PixelSprites';
import ContentNotes from '@/components/ContentNotes';
import type {
  CheatSheetSession,
  CodingLab,
  AddXpResult,
  CompleteNodeResult,
  NodeDepth,
  SessionMode,
  NodeDepthMode,
} from '@/types';

type ModalView = 'loading' | 'error' | 'lesson' | 'quiz' | 'lab' | 'teachback' | 'victory' | 'failure';
type AnswerState = 'idle' | 'correct' | 'wrong';

type QuizState = {
  index: number;
  selected: number | null;
  answered: AnswerState;
  wrongCount: number;
  correctCount: number;
  questionStartedAt: number;
};

type VictoryData = {
  xpGained: number;
  spGained: number;
  xpResult: AddXpResult;
  nodeResult: CompleteNodeResult | null;
  isPerfect: boolean;
  lifeRecovered: boolean;
  teachBackScore?: number;
};

const DEPTH_REWARDS: Record<NodeDepth, { xp: number; sp: number; perfectBonusXp: number }> = {
  0: { xp: 0, sp: 0, perfectBonusXp: 0 },
  1: { xp: 50, sp: 15, perfectBonusXp: 30 },
  2: { xp: 100, sp: 30, perfectBonusXp: 80 },
  3: { xp: 150, sp: 50, perfectBonusXp: 120 },
};

const LAB_BONUS = { xp: 500, sp: 100 };
const MASTER_PASS_SCORE = 0.8;
const MASTER_TEACHBACK_MIN = 7;
const QUIZ_TIME_LIMIT_SECONDS = 15;

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
      <code className="inline-code" {...props}>{children}</code>
    );
  },
};

function hashQuestion(question: string, codeSnippet?: string) {
  return `${question.slice(0, 120)}::${(codeSnippet ?? '').slice(0, 80)}`;
}

function getPassThreshold(depth: NodeDepth, total: number, practiceMode: boolean, recoveryMode: boolean, mode: SessionMode) {
  if (recoveryMode) return total;
  if (mode === 'daily-challenge') return Math.ceil(total * 0.6);
  if (practiceMode) return Math.max(1, Math.ceil(total * 0.67));
  if (depth === 1) return 3;
  if (depth === 2) return 4;
  if (depth === 3) return Math.ceil(total * MASTER_PASS_SCORE);
  return total;
}

function CheatSheetView({
  session,
  node,
  noteContextId,
  allowQuiz,
  allowLab,
  onStartQuiz,
  onOpenLab,
  onClose,
}: {
  session: CheatSheetSession;
  node: ReturnType<typeof getNode>;
  noteContextId: string;
  allowQuiz: boolean;
  allowLab: boolean;
  onStartQuiz: () => void;
  onOpenLab: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-content">
      <div className="modal-prose">
        <ReactMarkdown components={mdComponents}>{session.cheatSheet}</ReactMarkdown>
      </div>
      {node?.applications?.length ? (
        <section className="session-context">
          <h3>Professional Applications</h3>
          <ul>
            {node.applications.map((application) => <li key={application}>{application}</li>)}
          </ul>
        </section>
      ) : null}
      {node?.resources?.length ? (
        <section className="session-context">
          <h3>Official Resources</h3>
          <div className="session-resources">
            {node.resources.map((resource) => (
              <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer">
                <span>{resource.type === 'docs' ? '📘' : '🔎'}</span>
                <span>
                  <strong>{resource.title}</strong>
                  <small>{resource.type}</small>
                </span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
      <ContentNotes contextId={noteContextId} contentType="lesson" />
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
        {allowLab && <button id="open-lab-btn" className="btn btn-ghost" onClick={onOpenLab}>?? Coding Lab</button>}
        {allowQuiz && <button id="start-quiz-btn" className="btn btn-primary btn-3d" onClick={onStartQuiz}>Start Assessment ?</button>}
      </div>
    </div>
  );
}

function QuizView({
  session,
  quizState,
  timeLeft,
  timed,
  busy,
  onSelect,
  onCheck,
  onContinue,
}: {
  session: CheatSheetSession;
  quizState: QuizState;
  timeLeft: number;
  timed: boolean;
  busy: boolean;
  onSelect: (idx: number) => void;
  onCheck: () => void;
  onContinue: () => void;
}) {
  const quiz = session.quizzes[quizState.index];
  const total = session.quizzes.length;

  return (
    <div className="modal-content">
      <div className="quiz-progress" role="progressbar" aria-valuenow={quizState.index + 1} aria-valuemax={total}>
        <div className="quiz-progress__track">
          <div className="quiz-progress__fill" style={{ width: `${(quizState.index / total) * 100}%` }} />
        </div>
        <span className="quiz-progress__label">{quizState.index + 1} / {total}</span>
      </div>

      {timed && <div className="speed-quiz-timer">? {timeLeft}s</div>}
      <p className="quiz-question">{quiz.question}</p>

      {quiz.codeSnippet && (
        <div className="quiz-code-snippet">
          <SyntaxHighlighter style={vscDarkPlus} language="javascript" PreTag="div" customStyle={{ borderRadius: '0.75rem', fontSize: '0.82rem', margin: 0 }}>
            {quiz.codeSnippet}
          </SyntaxHighlighter>
        </div>
      )}

      <div className="quiz-options">
        {quiz.options.map((opt, index) => {
          let cls = 'quiz-option';
          if (quizState.selected === index) {
            if (quizState.answered === 'correct') cls += ' quiz-option--correct';
            else if (quizState.answered === 'wrong') cls += ' quiz-option--wrong';
            else cls += ' quiz-option--selected';
          } else if (quizState.answered !== 'idle' && index === quiz.correctIndex) {
            cls += ' quiz-option--correct';
          }
          return (
            <button
              key={index}
              id={`quiz-option-${index}`}
              className={cls}
              onClick={() => quizState.answered === 'idle' && onSelect(index)}
              disabled={quizState.answered !== 'idle' || busy}
            >
              <span className="quiz-option__letter">{['A', 'B', 'C', 'D'][index]}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {quizState.answered !== 'idle' && (
        <div className={`quiz-explanation quiz-explanation--${quizState.answered}`}>
          <span>{quizState.answered === 'correct' ? '?' : '?'}</span>
          <p>{quiz.explanation}</p>
        </div>
      )}

      <div className="modal-actions">
        {quizState.answered === 'idle' ? (
          <button id="check-answer-btn" className="btn btn-primary btn-3d" disabled={quizState.selected === null || busy} onClick={onCheck}>
            {busy ? 'Checking...' : 'Check Answer'}
          </button>
        ) : (
          <button id="continue-btn" className="btn btn-primary btn-3d" disabled={busy} onClick={onContinue}>
            {busy ? 'Saving...' : quizState.index < total - 1 ? 'Continue ?' : 'Finish ?'}
          </button>
        )}
      </div>
    </div>
  );
}

function TeachBackView({
  topic,
  model,
  language,
  onSubmit,
  onBack,
}: {
  topic: string;
  model: string;
  language: 'en' | 'pt-BR';
  onSubmit: (score: number) => void;
  onBack: () => void;
}) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; summary: string; missingConcepts: string[] } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await evaluateTeachBack(topic, text, model, language);
      setFeedback(result);
      if (result.score >= MASTER_TEACHBACK_MIN) onSubmit(result.score);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [topic, text, model, language, onSubmit]);

  return (
    <div className="modal-content">
      <h3 className="modal-section-title">Teach-Back</h3>
      <p className="modal-subtitle">Explain the concept in your own words (minimum 50 words).</p>
      <textarea id="teachback-input" className="teachback-input" value={text} onChange={(event) => setText(event.target.value)} rows={8} />
      {feedback && (
        <div className="teachback-feedback">
          <strong>Score: {feedback.score}/10</strong>
          <p>{feedback.summary}</p>
          {feedback.missingConcepts.length > 0 && <p>Missing: {feedback.missingConcepts.join(', ')}</p>}
        </div>
      )}
      {error && <GeminiErrorCard error={error} onRetry={handleSubmit} />}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onBack}>? Back</button>
        <button id="submit-teachback-btn" className="btn btn-primary btn-3d" disabled={loading || text.trim().split(/\s+/).length < 50} onClick={handleSubmit}>
          {loading ? 'Evaluating...' : 'Submit Explanation'}
        </button>
      </div>
    </div>
  );
}

function CodingLabView({
  contextId,
  apiKey,
  model,
  geminiTopic,
  language,
  onComplete,
  onBack,
}: {
  contextId: string;
  apiKey: string;
  model: string;
  geminiTopic: string;
  language: 'en' | 'pt-BR';
  onComplete: () => void;
  onBack: () => void;
}) {
  const [lab, setLab] = useState<CodingLab | null>(null);
  const [labError, setLabError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'instructions' | 'boilerplate' | 'tests'>('instructions');
  const [copied, setCopied] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    getCachedContent<CodingLab>(contextId, 2, 'lab', model)
      .then(async (cached) => {
        if (cached) return cached;
        const generated = await generateCodingLab(geminiTopic, apiKey, model, language);
        await saveCachedContent(contextId, 2, 'lab', model, generated);
        return generated;
      })
      .then(setLab)
      .catch(setLabError)
      .finally(() => setLoading(false));
  }, [contextId, geminiTopic, apiKey, model, language, loadAttempt]);

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
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = name;
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    });
  }, [lab]);

  if (loading) return <GeminiLoadingState message="Generating your coding lab..." />;
  if (labError || !lab) return <GeminiErrorCard error={labError} onRetry={() => {
    setLabError(null);
    setLoading(true);
    loadedRef.current = false;
    setLoadAttempt((current) => current + 1);
  }} />;

  const currentContent = activeTab === 'instructions' ? lab.instructions : activeTab === 'boilerplate' ? lab.boilerplateCode : lab.testCode;

  return (
    <div className="modal-content">
      <div className="lab-tabs">
        {(['instructions', 'boilerplate', 'tests'] as const).map((tab) => (
          <button key={tab} className={`lab-tab ${activeTab === tab ? 'lab-tab--active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'instructions' ? '?? Instructions' : tab === 'boilerplate' ? '?? Starter Code' : '?? Tests'}
          </button>
        ))}
      </div>
      <div className="lab-content">
        {activeTab === 'instructions' ? (
          <div className="modal-prose"><ReactMarkdown components={mdComponents}>{lab.instructions}</ReactMarkdown></div>
        ) : (
          <SyntaxHighlighter style={vscDarkPlus} language={lab.language} customStyle={{ borderRadius: '0.75rem', fontSize: '0.82rem', margin: 0, maxHeight: '50vh', overflowY: 'auto' }}>
            {currentContent}
          </SyntaxHighlighter>
        )}
      </div>
      <div className="lab-toolbar">
        <button className="btn btn-ghost btn-sm" onClick={() => copy(currentContent)}>{copied ? '? Copied!' : '?? Copy'}</button>
        <button className="btn btn-ghost btn-sm" onClick={downloadFiles}>?? Download Files</button>
      </div>
      <ContentNotes contextId={contextId} contentType="lab" />
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onBack}>? Back to Lesson</button>
        <button id="complete-lab-btn" className="btn btn-success btn-3d" onClick={onComplete}>? Mark Lab Complete</button>
      </div>
    </div>
  );
}

function ResultView({
  type,
  title,
  description,
  onPrimary,
  onSecondary,
  primaryLabel,
  secondaryLabel,
}: {
  type: 'success' | 'failure';
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="modal-content victory-screen">
      <div className="victory-emoji">{type === 'success' ? '??' : '??'}</div>
      <h2 className="victory-title">{title}</h2>
      <p className="victory-node">{description}</p>
      <div className="modal-actions" style={{ justifyContent: 'center' }}>
        {onSecondary && secondaryLabel && <button className="btn btn-ghost" onClick={onSecondary}>{secondaryLabel}</button>}
        <button className="btn btn-primary btn-3d" onClick={onPrimary}>{primaryLabel}</button>
      </div>
    </div>
  );
}

function VictoryView({ victory, nodeTitle, onClose }: { victory: VictoryData; nodeTitle: string; onClose: () => void }) {
  const { avatarId, equippedItems, companion, streak } = useGameState();

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    if (victory.xpResult.leveledUp) playLevelUp();
    else playCoins();
  }, [victory.xpResult.leveledUp]);

  const unlockedGear = victory.nodeResult?.newlyUnlockedGear.map((id) => getGearItem(id)).filter(Boolean) ?? [];
  const unlockedCosmetics = victory.nodeResult?.newlyUnlockedCosmetics.map((id) => getCosmeticItem(id)).filter(Boolean) ?? [];

  return (
    <div className="modal-content victory-screen">
      <div className="victory-emoji">??</div>
      <h2 className="victory-title">Session Complete!</h2>
      <p className="victory-node">{nodeTitle}</p>
      <div className="victory-rewards">
        <div className="reward-chip reward-chip--xp"><span>? +{victory.xpGained} XP</span></div>
        <div className="reward-chip reward-chip--sp"><span>?? +{victory.spGained} SP</span></div>
        {victory.lifeRecovered && <div className="reward-chip reward-chip--life"><span>? +1 Life</span></div>}
        {victory.teachBackScore && <div className="reward-chip reward-chip--perfect"><span>?? {victory.teachBackScore}/10</span></div>}
      </div>

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
          {unlockedGear.map((item) => item && (
            <div key={item.id} className={`victory-gear-card victory-gear-card--${item.rarity}`}>
              <span className="victory-gear-card__art">{item.emoji}</span>
              <span className="victory-gear-card__name">{item.name}</span>
              <span className="victory-gear-card__flavor">{item.flavorText}</span>
            </div>
          ))}
        </div>
      )}

      {unlockedCosmetics.length > 0 && (
        <div className="victory-gear">
          {unlockedCosmetics.map((item) => item && (
            <div key={item.id} className="victory-gear-card victory-gear-card--rare">
              <span className="victory-gear-card__art">{item.emoji}</span>
              <span className="victory-gear-card__name">{item.name}</span>
              <span className="victory-gear-card__flavor">Master reward milestone unlocked</span>
            </div>
          ))}
        </div>
      )}

      <div className="modal-actions" style={{ justifyContent: 'center' }}>
        <button className="btn btn-primary btn-3d" onClick={onClose}>Back to Skill Tree ?</button>
      </div>
    </div>
  );
}

interface SessionModalProps {
  nodeId?: string;
  pathId?: string;
  practiceQuestion?: string;
  onClose: () => void;
  practiceMode?: boolean;
  recoveryMode?: boolean;
  onRetryRecovery?: () => void;
  depth?: NodeDepth;
  mode?: SessionMode;
  isReplay?: boolean;
  reviewPrompt?: string;
  onReviewComplete?: () => void;
  dailyChallengeDate?: string;
  onDailyChallengePassed?: (score: number, total: number) => Promise<{
    xpGained: number;
    spGained: number;
    xpResult: AddXpResult;
  }>;
  onDailyChallengeFinished?: () => void;
}

export default function SessionModal({
  nodeId,
  pathId,
  practiceQuestion,
  onClose,
  practiceMode = false,
  recoveryMode = false,
  onRetryRecovery,
  depth = 1,
  mode = 'learn',
  isReplay = false,
  reviewPrompt,
  onReviewComplete,
  dailyChallengeDate,
  onDailyChallengePassed,
  onDailyChallengeFinished,
}: SessionModalProps) {
  const {
    geminiApiKey,
    selectedModel,
    language,
    completedLabs,
    nodeDepths,
    addXp,
    addStudyPoints,
    loseLife,
    gainLife,
    completeDepth,
    markDeepenLabComplete,
    incrementPerfectLessons,
    incrementLifeRecoveries,
  } = useGameState();

  const node = nodeId ? getNode(nodeId) : null;
  const nodeMode: NodeDepthMode = depth === 1 ? 'learn' : depth === 2 ? 'deepen' : 'master';
  const lessonTopic = mode === 'review'
    ? reviewPrompt ?? (node ? getNodeTopic(node, nodeMode) : practiceQuestion ?? '')
    : node ? getNodeTopic(node, nodeMode) : practiceQuestion ?? '';
  const noteContextId = `${nodeId ?? 'practice'}:${depth}:${mode}`;
  const alreadyCompleted = nodeId ? (nodeDepths[nodeId] ?? 0) >= depth : false;
  const dailyChallengeMode = mode === 'daily-challenge';
  const showLab = !practiceMode && !recoveryMode && !dailyChallengeMode && depth === 2;
  const timedQuiz = mode === 'master';

  const [view, setView] = useState<ModalView>('loading');
  const [session, setSession] = useState<CheatSheetSession | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    index: 0,
    selected: null,
    answered: 'idle',
    wrongCount: 0,
    correctCount: 0,
    questionStartedAt: Date.now(),
  });
  const [victory, setVictory] = useState<VictoryData | null>(null);
  const [labCompletedThisRun, setLabCompletedThisRun] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT_SECONDS);
  const [actionBusy, setActionBusy] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const loadedRef = useRef(false);
  const answerSubmittingRef = useRef(false);
  const continueSubmittingRef = useRef(false);
  const handleCheckRef = useRef<(timedOut?: boolean) => void>(() => undefined);
  const trackerRef = useRef<ReturnType<typeof createActiveTimeTracker> | null>(null);
  const eventRecordedRef = useRef(false);
  const eventKeyRef = useRef(`session:${nodeId ?? 'practice'}:${mode}:${Date.now()}`);

  const recordSessionEvent = useCallback((outcome: string, xpDelta = 0, spDelta = 0) => {
    if (eventRecordedRef.current) return;
    eventRecordedRef.current = true;
    const eventType =
      dailyChallengeMode ? 'daily_challenge'
      : mode === 'review' ? 'srs_review'
      : practiceMode || recoveryMode ? 'practice'
      : 'node_assessment';
    void recordStudyEvent({
      eventKey: eventKeyRef.current,
      eventType,
      nodeId,
      pathId: pathId || node?.pathId,
      depth,
      outcome,
      activeSeconds: trackerRef.current?.seconds() ?? 0,
      xpDelta,
      spDelta,
      metadata: { mode, replay: isReplay },
    });
  }, [dailyChallengeMode, mode, practiceMode, recoveryMode, nodeId, pathId, node?.pathId, depth, isReplay]);

  useEffect(() => {
    if (loadedRef.current) return;
    if (!lessonTopic) return;
    loadedRef.current = true;

    const loader = dailyChallengeMode && nodeId && dailyChallengeDate
      ? getCachedContent<CheatSheetSession>(`daily:${dailyChallengeDate}:${nodeId}`, depth, 'daily-challenge', selectedModel)
          .then(async (cached) => {
            if (cached) return cached;
            const generated = await generateDailyChallenge(lessonTopic, selectedModel, language);
            await saveCachedContent(`daily:${dailyChallengeDate}:${nodeId}`, depth, 'daily-challenge', selectedModel, generated);
            return generated;
          })
      : mode === 'review' && nodeId
      ? getCachedContent<CheatSheetSession>(nodeId, depth, 'review', selectedModel)
          .then(async (cached) => {
            if (cached) return cached;
            const generated = await generatePracticeSession(lessonTopic, geminiApiKey, selectedModel, language);
            await saveCachedContent(nodeId, depth, 'review', selectedModel, generated);
            return generated;
          })
      : practiceMode || recoveryMode || !nodeId
      ? generatePracticeSession(lessonTopic, geminiApiKey, selectedModel, language)
      : mode === 'master'
      ? getCachedContent<CheatSheetSession>(nodeId, 3, 'master', selectedModel)
          .then(async (cached) => {
            if (cached) return cached;
            const generated = await generateMasterSession(lessonTopic, geminiApiKey, selectedModel, language);
            await saveCachedContent(nodeId, 3, 'master', selectedModel, generated);
            return generated;
          })
      : getCachedContent<CheatSheetSession>(nodeId, depth, 'lesson', selectedModel)
          .then(async (cached) => {
            if (cached) return cached;
            const generated = await generateLesson(lessonTopic, geminiApiKey, selectedModel, nodeMode, language);
            await saveCachedContent(nodeId, depth, 'lesson', selectedModel, generated);
            return generated;
          });

    loader
      .then((payload) => {
        setSession(payload);
        setView(mode === 'replay-assessment' || mode === 'master' || mode === 'review' || dailyChallengeMode || practiceMode || recoveryMode ? 'quiz' : 'lesson');
      })
      .catch((err: Error) => {
        setError(err);
        setView('error');
      });
  }, [lessonTopic, practiceMode, recoveryMode, dailyChallengeMode, dailyChallengeDate, nodeId, geminiApiKey, selectedModel, language, mode, depth, nodeMode, loadAttempt]);

  useEffect(() => {
    trackerRef.current = createActiveTimeTracker();
    document.body.style.overflow = 'hidden';
    document.body.classList.add('session-modal-open');
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('session-modal-open');
      trackerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!timedQuiz || view !== 'quiz' || quizState.answered !== 'idle') {
      if (timedQuiz) setTimeLeft(QUIZ_TIME_LIMIT_SECONDS);
      return;
    }

    setTimeLeft(QUIZ_TIME_LIMIT_SECONDS);
    const interval = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          clearInterval(interval);
          setTimeout(() => handleCheckRef.current(true), 0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timedQuiz, view, quizState.index, quizState.answered]);

  const retry = useCallback(() => {
    setError(null);
    setView('loading');
    loadedRef.current = false;
    setLoadAttempt((current) => current + 1);
  }, []);

  const handleStartQuiz = useCallback(() => {
    setQuizState({ index: 0, selected: null, answered: 'idle', wrongCount: 0, correctCount: 0, questionStartedAt: Date.now() });
    setView('quiz');
  }, []);

  const handleSelect = useCallback((index: number) => {
    setQuizState((current) => ({ ...current, selected: index }));
  }, []);

  const finalizeFailure = useCallback(async () => {
    if (nodeId && !practiceMode && !recoveryMode && !dailyChallengeMode) {
      await upsertSrsSchedule(nodeId, false, depth);
    }
    recordSessionEvent('failed');
    setView('failure');
  }, [nodeId, practiceMode, recoveryMode, dailyChallengeMode, depth, recordSessionEvent]);

  const applyRewards = useCallback((teachBackScore?: number) => {
    const rewards = DEPTH_REWARDS[practiceMode || recoveryMode ? 1 : depth];
    const perfect = quizState.wrongCount === 0;
    let xpGained = rewards.xp;
    let spGained = rewards.sp;

    if (isReplay) {
      xpGained = 0;
      spGained = 0;
    } else if (mode === 'review') {
      xpGained = 20;
      spGained = 5;
    } else if (perfect) {
      xpGained += rewards.perfectBonusXp;
      if (!practiceMode && !recoveryMode) incrementPerfectLessons();
    }

    if (!isReplay && mode !== 'review' && depth === 2 && (labCompletedThisRun || completedLabs.includes(nodeId ?? ''))) {
      xpGained += LAB_BONUS.xp;
      spGained += LAB_BONUS.sp;
    }

    if (practiceMode) {
      xpGained = 25;
      spGained = 15;
    }

    const xpResult = addXp(xpGained);
    addStudyPoints(spGained);

    let nodeResult: CompleteNodeResult | null = null;
    if (!practiceMode && !recoveryMode && nodeId && !isReplay && !alreadyCompleted) {
      nodeResult = completeDepth(nodeId, depth);
    }

    const lifeRecovered = recoveryMode && perfect;
    if (lifeRecovered) {
      gainLife();
      incrementLifeRecoveries();
    }

    setVictory({
      xpGained,
      spGained,
      xpResult,
      nodeResult,
      isPerfect: perfect,
      lifeRecovered,
      teachBackScore,
    });
    recordSessionEvent('passed', xpGained, spGained);
    setView('victory');
    if (mode === 'review') onReviewComplete?.();
  }, [depth, practiceMode, recoveryMode, quizState.wrongCount, incrementPerfectLessons, labCompletedThisRun, completedLabs, nodeId, addXp, addStudyPoints, isReplay, alreadyCompleted, completeDepth, gainLife, incrementLifeRecoveries, mode, onReviewComplete, recordSessionEvent]);

  const handleCheck = useCallback(async (timedOut = false) => {
    if (!session || answerSubmittingRef.current || quizState.answered !== 'idle') return;
    answerSubmittingRef.current = true;
    setActionBusy(true);
    const quiz = session.quizzes[quizState.index];
    const selected = timedOut ? -1 : quizState.selected;
    const correct = selected === quiz.correctIndex;
    const timeTakenMs = Date.now() - quizState.questionStartedAt;

    if (!correct && !dailyChallengeMode) loseLife();
    if (correct) playCorrect();
    else playWrong();

    try {
      if (nodeId) {
        await saveQuizResult({
          nodeId,
          depth,
          questionHash: quiz.questionHash ?? hashQuestion(quiz.question, quiz.codeSnippet),
          correct,
          timeTakenMs,
        });
      }

      setQuizState((current) => ({
        ...current,
        answered: correct ? 'correct' : 'wrong',
        wrongCount: current.wrongCount + (correct ? 0 : 1),
        correctCount: current.correctCount + (correct ? 1 : 0),
        selected: timedOut ? null : current.selected,
      }));
    } finally {
      answerSubmittingRef.current = false;
      setActionBusy(false);
    }
  }, [session, quizState.index, quizState.selected, quizState.questionStartedAt, quizState.answered, loseLife, nodeId, depth, dailyChallengeMode]);
  handleCheckRef.current = handleCheck;

  const handleContinue = useCallback(async () => {
    if (!session || continueSubmittingRef.current) return;
    continueSubmittingRef.current = true;
    setActionBusy(true);
    try {
      const total = session.quizzes.length;
      const isLast = quizState.index >= total - 1;

      if (!isLast) {
        setQuizState((current) => ({
          ...current,
          index: current.index + 1,
          selected: null,
          answered: 'idle',
          questionStartedAt: Date.now(),
        }));
        return;
      }

      const finalCorrectCount = quizState.correctCount;
      const passThreshold = getPassThreshold(depth, total, practiceMode, recoveryMode, mode);
      const passed = finalCorrectCount >= passThreshold;

      if (!passed) {
        await finalizeFailure();
        if (mode === 'review') onReviewComplete?.();
        return;
      }

      if (dailyChallengeMode && onDailyChallengePassed) {
        const reward = await onDailyChallengePassed(finalCorrectCount, total);
        setVictory({
          xpGained: reward.xpGained,
          spGained: reward.spGained,
          xpResult: reward.xpResult,
          nodeResult: null,
          isPerfect: finalCorrectCount === total,
          lifeRecovered: false,
        });
        recordSessionEvent('passed', reward.xpGained, reward.spGained);
        setView('victory');
        onDailyChallengeFinished?.();
        return;
      }

      if (nodeId && !practiceMode && !recoveryMode) {
        await upsertSrsSchedule(nodeId, true, depth);
      }

      if (mode === 'master') {
        setView('teachback');
        return;
      }

      applyRewards();
    } finally {
      continueSubmittingRef.current = false;
      setActionBusy(false);
    }
  }, [session, quizState.index, quizState.correctCount, depth, practiceMode, recoveryMode, mode, finalizeFailure, dailyChallengeMode, onDailyChallengePassed, onDailyChallengeFinished, nodeId, applyRewards, onReviewComplete, recordSessionEvent]);

  const handleLabComplete = useCallback(() => {
    setLabCompletedThisRun(true);
    if (nodeId) markDeepenLabComplete(nodeId);
    void recordStudyEvent({
      eventKey: `${eventKeyRef.current}:lab`,
      eventType: 'coding_lab',
      nodeId,
      pathId: pathId || node?.pathId,
      depth,
      outcome: 'completed',
      activeSeconds: trackerRef.current?.seconds() ?? 0,
    });
    setView('lesson');
  }, [nodeId, pathId, node?.pathId, depth, markDeepenLabComplete]);

  const handleTeachBackSuccess = useCallback((score: number) => {
    if (score < MASTER_TEACHBACK_MIN) {
      setView('failure');
      return;
    }
    applyRewards(score);
  }, [applyRewards]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      recordSessionEvent('abandoned');
      onClose();
    }
  }, [onClose, recordSessionEvent]);

  const closeSession = useCallback(() => {
    recordSessionEvent('abandoned');
    onClose();
  }, [onClose, recordSessionEvent]);

  if (!node && !practiceQuestion) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label={node?.title ?? session?.title ?? 'Practice Session'}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-header__left">
            {node && <span className="modal-node-icon">{node.icon}</span>}
            <div>
              <h2 className="modal-title">{session?.title ?? node?.title ?? 'Practice Session'}</h2>
              {node && <span className="modal-subtitle">~{node.estimatedMinutes} min · {mode}</span>}
            </div>
          </div>
          <button id="modal-close-btn" className="modal-close" onClick={closeSession} aria-label="Close">?</button>
        </div>

        <div className="modal-body">
          {view === 'loading' && <GeminiLoadingState message="Generating your session..." />}
          {view === 'error' && <GeminiErrorCard error={error} onRetry={retry} />}

          {view === 'lesson' && session && (
            <CheatSheetView
              session={session}
              node={node ?? undefined}
              noteContextId={noteContextId}
              allowQuiz={mode !== 'replay-view'}
              allowLab={showLab}
              onStartQuiz={handleStartQuiz}
              onOpenLab={() => setView('lab')}
              onClose={closeSession}
            />
          )}

          {view === 'quiz' && session && (
            <QuizView
              session={session}
              quizState={quizState}
              timeLeft={timeLeft}
              timed={timedQuiz}
              busy={actionBusy}
              onSelect={handleSelect}
              onCheck={() => void handleCheck(false)}
              onContinue={() => void handleContinue()}
            />
          )}

          {view === 'lab' && showLab && (
            <CodingLabView
              contextId={nodeId ?? noteContextId}
              apiKey={geminiApiKey}
              model={selectedModel}
              geminiTopic={lessonTopic}
              language={language}
              onComplete={handleLabComplete}
              onBack={() => setView('lesson')}
            />
          )}

          {view === 'teachback' && node && (
            <TeachBackView
              topic={lessonTopic}
              model={selectedModel}
              language={language}
              onSubmit={handleTeachBackSuccess}
              onBack={() => setView('quiz')}
            />
          )}

          {view === 'failure' && (
            <ResultView
              type="failure"
              title="Assessment failed"
              description={recoveryMode
                ? 'A perfect run is required to recover a life.'
                : dailyChallengeMode
                  ? 'Score at least 3/5. You can retry today without losing lives.'
                  : 'You lost a life, but you can retry this level immediately.'}
              primaryLabel="Retry"
              onPrimary={() => {
                setQuizState({ index: 0, selected: null, answered: 'idle', wrongCount: 0, correctCount: 0, questionStartedAt: Date.now() });
                setView('quiz');
              }}
              secondaryLabel="Close"
              onSecondary={onRetryRecovery ?? closeSession}
            />
          )}

          {view === 'victory' && victory && <VictoryView victory={victory} nodeTitle={node?.title ?? session?.title ?? 'Practice Session'} onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
