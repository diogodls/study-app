import { useEffect, useRef, useState } from 'react';
import { getAssessment, completeAssessment } from '@/services/assessmentService';
import { createActiveTimeTracker, recordStudyEvent } from '@/services/analyticsService';
import { useGameState } from '@/context/GameStateContext';
import { getDisplayPathIcon } from '@/config/paths';
import type { LearningPath, CheatSheetSession } from '@/types';
import GeminiLoadingState from '@/components/GeminiLoadingState';
import GeminiErrorCard from '@/components/GeminiErrorCard';

export default function SkillAssessmentModal({
  path,
  onClose,
  onPassed,
}: {
  path: LearningPath;
  onClose: () => void;
  onPassed: (nodeIds: string[]) => void;
}) {
  const { selectedModel, language } = useGameState();
  const [session, setSession] = useState<CheatSheetSession | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const [passed, setPassed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const trackerRef = useRef<ReturnType<typeof createActiveTimeTracker> | null>(null);
  const eventKeyRef = useRef(`assessment:${path.id}:${Date.now()}`);
  const topics = path.nodes.slice(0, 3).map((node) => `${node.title}: ${node.depthTopics?.learn ?? node.geminiTopic}`).join('\n');

  useEffect(() => {
    trackerRef.current = createActiveTimeTracker();
    setError(null);
    getAssessment(path.id, topics, selectedModel, language).then(setSession).catch(setError);
    return () => { trackerRef.current?.stop(); };
  }, [path.id, topics, selectedModel, language, loadAttempt]);

  const submit = async () => {
    if (!session || selected === null) return;
    setBusy(true);
    const correct = selected === session.quizzes[index].correctIndex;
    const nextAnswers = [...answers, correct];
    setAnswers(nextAnswers);
    setSelected(null);
    if (index < session.quizzes.length - 1) {
      setIndex((current) => current + 1);
      setBusy(false);
      return;
    }
    const score = nextAnswers.filter(Boolean).length;
    const result = await completeAssessment(path.id, score, path.nodes.slice(0, 3).map((node) => node.id));
    setPassed(result.passed);
    setDone(true);
    if (result.passed) onPassed(path.nodes.slice(0, 3).map((node) => node.id));
    await recordStudyEvent({
      eventKey: eventKeyRef.current,
      eventType: 'skill_assessment',
      pathId: path.id,
      outcome: result.passed ? 'passed' : 'failed',
      activeSeconds: trackerRef.current?.seconds() ?? 0,
      metadata: { score, total: 5 },
    });
    setBusy(false);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal assessment-modal">
        <div className="modal-header">
          <div><h2 className="modal-title">{getDisplayPathIcon(path.id)} {path.title}</h2><span className="modal-subtitle">5-question level assessment · no lives or rewards</span></div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {!session && !error && <GeminiLoadingState message="Preparing your assessment…" />}
          {error && <GeminiErrorCard error={error} onRetry={() => setLoadAttempt((current) => current + 1)} />}
          {session && !done && (
            <div className="modal-content">
              <span className="assessment-progress">Question {index + 1} of 5</span>
              <h3>{session.quizzes[index].question}</h3>
              {session.quizzes[index].codeSnippet && <pre className="assessment-code">{session.quizzes[index].codeSnippet}</pre>}
              <div className="quiz-options">
                {session.quizzes[index].options.map((option, optionIndex) => (
                  <button key={option} className={`quiz-option${selected === optionIndex ? ' quiz-option--selected' : ''}`} onClick={() => setSelected(optionIndex)}>
                    {option}
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-3d" disabled={selected === null || busy} onClick={() => void submit()}>Confirm answer</button>
            </div>
          )}
          {done && (
            <div className="modal-content assessment-result">
              <span>{passed ? '🚀' : '📚'}</span>
              <h3>{passed ? 'Level tested' : 'Start with the foundations'}</h3>
              <p>{passed ? 'Learn was unlocked for the first three nodes without XP or SP.' : 'You need 4/5. No progress was changed, and you can retry whenever you want.'}</p>
              <button className="btn btn-primary btn-3d" onClick={onClose}>Back to path</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
