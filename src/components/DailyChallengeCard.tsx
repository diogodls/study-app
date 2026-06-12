import { useEffect, useState } from 'react';
import { useGameState } from '@/context/GameStateContext';
import {
  getOrCreateDailyChallenge,
  type DailyChallenge,
  type DailyChallengeState,
} from '@/services/dailyChallengeService';

export default function DailyChallengeCard({
  refreshKey,
  onStart,
}: {
  refreshKey: number;
  onStart: (challenge: DailyChallenge) => void;
}) {
  const { nodeDepths, selectedPathId } = useGameState();
  const [state, setState] = useState<DailyChallengeState | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError('');
    getOrCreateDailyChallenge(nodeDepths, selectedPathId)
      .then((result) => {
        if (!cancelled) setState(result);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load today’s challenge.');
      });
    return () => {
      cancelled = true;
    };
  }, [nodeDepths, selectedPathId, refreshKey]);

  if (error) return <div className="card daily-challenge-card daily-challenge-card--error">{error}</div>;
  if (!state) return <div className="card daily-challenge-card daily-challenge-card--loading">Loading daily challenge…</div>;

  const { challenge, stats } = state;
  return (
    <section className={`card daily-challenge-card${challenge.completed ? ' daily-challenge-card--completed' : ''}`}>
      <div className="daily-challenge-card__heading">
        <div>
          <span className="daily-challenge-card__eyebrow">Daily Challenge</span>
          <h2>{challenge.icon} {challenge.title}</h2>
          <p>Complete 5 questions and score at least 3/5.</p>
        </div>
        <div className="daily-challenge-card__streak" title="Daily challenge streak">
          🔥 <strong>{stats.currentStreak}</strong>
        </div>
      </div>

      <div className="daily-challenge-card__meta">
        <span>+75 XP</span>
        <span>+25 SP</span>
        <span>+25 XP perfect</span>
        <span>Depth {challenge.depth}</span>
      </div>

      {challenge.completed ? (
        <div className="daily-challenge-card__complete">
          <strong>Completed today</strong>
          <span>{challenge.score}/{challenge.totalQuestions} · +{challenge.xpAwarded} XP · +{challenge.spAwarded} SP</span>
        </div>
      ) : (
        <button className="btn btn-primary btn-3d" onClick={() => onStart(challenge)}>
          Start Daily Challenge →
        </button>
      )}
    </section>
  );
}
