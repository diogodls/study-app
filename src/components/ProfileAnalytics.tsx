import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LEARNING_PATHS, getNode, isNodeUnlocked } from '@/config/paths';
import { getAnalyticsData } from '@/services/analyticsService';
import { getDueReviews } from '@/services/srsService';
import { getOrCreateDailyChallenge } from '@/services/dailyChallengeService';
import { useGameState } from '@/context/GameStateContext';
import type { AnalyticsSummary, DailyActivity, PathPerformance, WeakTopic, WeeklyPerformance } from '@/types';

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function ProfileAnalytics() {
  const navigate = useNavigate();
  const { nodeDepths, selectedPathId } = useGameState();
  const [data, setData] = useState<{
    summary: AnalyticsSummary;
    heatmap: DailyActivity[];
    weeks: WeeklyPerformance[];
    weakTopics: WeakTopic[];
    paths: PathPerformance[];
  } | null>(null);
  const [nextAction, setNextAction] = useState<{ title: string; detail: string; action: () => void } | null>(null);

  useEffect(() => {
    void Promise.all([
      getAnalyticsData(nodeDepths),
      getDueReviews(1),
      getOrCreateDailyChallenge(nodeDepths, selectedPathId),
    ]).then(([analytics, reviews, daily]) => {
      setData(analytics);
      if (reviews[0]) {
        setNextAction({ title: `Review ${reviews[0].title}`, detail: 'A spaced-repetition review is due now.', action: () => navigate('/practice') });
      } else if (analytics.weakTopics[0]) {
        const weak = analytics.weakTopics[0];
        setNextAction({ title: `Strengthen ${weak.title}`, detail: `${weak.accuracy}% accuracy across ${weak.attempts} answers.`, action: () => navigate('/', { state: { focusNodeId: weak.nodeId } }) });
      } else if (!daily.challenge.completed) {
        setNextAction({ title: 'Complete today’s challenge', detail: 'A short 5-question challenge is waiting.', action: () => navigate('/practice') });
      } else {
        const path = LEARNING_PATHS.find((item) => item.id === selectedPathId) ?? LEARNING_PATHS[0];
        const completed = Object.entries(nodeDepths).filter(([, depth]) => depth >= 1).map(([id]) => id);
        const next = path.nodes.find((node) => (nodeDepths[node.id] ?? 0) === 0 && isNodeUnlocked(node, completed));
        setNextAction({
          title: next ? `Learn ${next.title}` : 'Choose your next path',
          detail: next ? 'Continue from the next available node.' : 'Your current path has no pending Learn nodes.',
          action: () => navigate('/', { state: next ? { focusNodeId: next.id } : undefined }),
        });
      }
    });
  }, [nodeDepths, selectedPathId, navigate]);

  const heatmap = useMemo(() => {
    const map = new Map(data?.heatmap.map((day) => [day.date, day]) ?? []);
    return Array.from({ length: 365 }, (_, offset) => {
      const date = new Date();
      date.setDate(date.getDate() - (364 - offset));
      const key = date.toISOString().slice(0, 10);
      return { key, seconds: map.get(key)?.activeSeconds ?? 0 };
    });
  }, [data]);

  if (!data) return <div className="card analytics-empty">Loading your learning analytics…</div>;
  const accuracy = data.summary.questionsAnswered ? Math.round(data.summary.correctAnswers / data.summary.questionsAnswered * 100) : 0;
  const bestWeekXp = Math.max(0, ...data.weeks.map((week) => week.xpEarned));
  const rankedWeeks = [...data.weeks].sort((a, b) => b.xpEarned - a.xpEarned);

  return (
    <div className="analytics-dashboard">
      {nextAction && (
        <section className="card next-action-card">
          <span>Next best action</span>
          <h2>{nextAction.title}</h2>
          <p>{nextAction.detail}</p>
          <button className="btn btn-primary btn-3d" onClick={nextAction.action}>Start now →</button>
        </section>
      )}
      <div className="analytics-stats">
        {[
          ['Active time', formatTime(data.summary.activeSeconds)],
          ['Accuracy', `${accuracy}%`],
          ['Questions', data.summary.questionsAnswered],
          ['Learned', data.summary.learnedNodes],
          ['Mastered', data.summary.masteredNodes],
        ].map(([label, value]) => <div key={label} className="card"><strong>{value}</strong><span>{label}</span></div>)}
      </div>
      <section className="card analytics-section">
        <h2>Study activity</h2>
        <div className="study-heatmap" aria-label="365-day study heatmap">
          {heatmap.map((day) => (
            <span key={day.key} title={`${day.key}: ${formatTime(day.seconds)}`} data-level={day.seconds === 0 ? 0 : day.seconds < 600 ? 1 : day.seconds < 1800 ? 2 : day.seconds < 3600 ? 3 : 4} />
          ))}
        </div>
        {!data.heatmap.length && <p className="analytics-empty">Precise activity history starts with this version.</p>}
      </section>
      <section className="card analytics-section">
        <h2>Best paths</h2>
        <div className="path-performance-list">
          {data.paths.slice(0, 10).map((item, index) => {
            const path = LEARNING_PATHS.find((candidate) => candidate.id === item.pathId);
            if (!path) return null;
            return (
              <div key={item.pathId}>
                <div>
                  <strong>#{index + 1} {path.icon} {path.shortTitle}</strong>
                  <span>{item.masteryPercent}% mastery · {item.accuracy ?? '—'}% accuracy · {formatTime(item.activeSeconds)}</span>
                </div>
                <div className="analytics-bar"><span style={{ width: `${item.masteryPercent}%`, background: path.color }} /></div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="card analytics-section">
        <h2>Weak topics</h2>
        {data.weakTopics.length
          ? data.weakTopics.map((topic) => <button key={topic.nodeId} className="weak-topic" onClick={() => navigate('/', { state: { focusNodeId: topic.nodeId } })}><span>{getNode(topic.nodeId)?.icon} {topic.title}</span><strong>{topic.accuracy}%</strong></button>)
          : <p className="analytics-empty">Answer at least three questions on a topic to identify weak areas.</p>}
      </section>
      <section className="card analytics-section">
        <h2>Best weeks</h2>
        <div className="weekly-leaderboard">
          {rankedWeeks.map((week, index) => (
            <div key={week.weekStart} className={week.xpEarned === bestWeekXp && bestWeekXp > 0 ? 'record' : ''}>
              <strong>#{index + 1}</strong>
              <span>Week of {week.weekStart}<small>{formatTime(week.activeSeconds)} · {week.accuracy ?? '—'}% accuracy · {week.sessions} sessions · {week.nodesAdvanced} advances</small></span>
              <b>{week.xpEarned} XP</b>
            </div>
          ))}
          {!rankedWeeks.length && <p className="analytics-empty">Complete sessions to start your weekly leaderboard.</p>}
        </div>
      </section>
    </div>
  );
}
