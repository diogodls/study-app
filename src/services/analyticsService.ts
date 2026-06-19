import { LEARNING_PATHS, getNode } from '@/config/paths';
import { supabase } from '@/services/supabaseClient';
import type {
  AnalyticsSummary,
  DailyActivity,
  NodeDepth,
  PathPerformance,
  StudyEventType,
  WeakTopic,
  WeeklyPerformance,
} from '@/types';

export async function recordStudyEvent(input: {
  eventKey: string;
  eventType: StudyEventType;
  nodeId?: string;
  pathId?: string;
  depth?: NodeDepth;
  outcome: string;
  activeSeconds: number;
  xpDelta?: number;
  spDelta?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  const { error } = await supabase.from('user_study_events').upsert({
    user_id: data.user.id,
    event_key: input.eventKey,
    event_type: input.eventType,
    node_id: input.nodeId ?? null,
    path_id: input.pathId ?? null,
    depth: input.depth ?? null,
    outcome: input.outcome,
    active_seconds: input.activeSeconds,
    xp_delta: input.xpDelta ?? 0,
    sp_delta: input.spDelta ?? 0,
    metadata: input.metadata ?? {},
  }, { onConflict: 'user_id,event_key', ignoreDuplicates: true });
  if (error) console.warn('Unable to record study event:', error.message);
}

export function createActiveTimeTracker() {
  let seconds = 0;
  let lastInteraction = Date.now();
  let visible = document.visibilityState === 'visible';
  const touch = () => { lastInteraction = Date.now(); };
  const visibility = () => { visible = document.visibilityState === 'visible'; touch(); };
  const interval = window.setInterval(() => {
    if (visible && Date.now() - lastInteraction <= 60_000) seconds += 1;
  }, 1000);
  ['pointerdown', 'keydown', 'scroll'].forEach((event) => window.addEventListener(event, touch, { passive: true }));
  document.addEventListener('visibilitychange', visibility);
  return {
    seconds: () => seconds,
    stop: () => {
      window.clearInterval(interval);
      ['pointerdown', 'keydown', 'scroll'].forEach((event) => window.removeEventListener(event, touch));
      document.removeEventListener('visibilitychange', visibility);
      return seconds;
    },
  };
}

export async function getAnalyticsData(nodeDepths: Record<string, NodeDepth>) {
  const [{ data: summaryRows }, { data: heatRows }, { data: weekRows }, { data: quizRows }, { data: eventRows }] = await Promise.all([
    supabase.rpc('get_analytics_summary'),
    supabase.rpc('get_activity_heatmap'),
    supabase.rpc('get_weekly_performance'),
    supabase.from('user_quiz_results').select('node_id,correct'),
    supabase.from('user_study_events').select('path_id,active_seconds'),
  ]);
  const raw = summaryRows?.[0];
  const summary: AnalyticsSummary = {
    activeSeconds: Number(raw?.active_seconds ?? 0),
    questionsAnswered: Number(raw?.questions_answered ?? 0),
    correctAnswers: Number(raw?.correct_answers ?? 0),
    sessions: Number(raw?.sessions ?? 0),
    learnedNodes: Number(raw?.learned_nodes ?? 0),
    masteredNodes: Number(raw?.mastered_nodes ?? 0),
  };
  const heatmap: DailyActivity[] = (heatRows ?? []).map((row: Record<string, unknown>) => ({
    date: row.activity_date,
    activeSeconds: Number(row.active_seconds),
    eventCount: Number(row.event_count),
  }));
  const weeks: WeeklyPerformance[] = (weekRows ?? []).map((row: Record<string, unknown>) => ({
    weekStart: row.week_start,
    xpEarned: Number(row.xp_earned),
    activeSeconds: Number(row.active_seconds),
    sessions: Number(row.sessions),
    nodesAdvanced: Number(row.nodes_advanced),
    accuracy: row.questions_answered
      ? Math.round(Number(row.correct_answers ?? 0) / Number(row.questions_answered) * 100)
      : null,
  }));

  const resultMap = new Map<string, { attempts: number; correct: number }>();
  for (const result of quizRows ?? []) {
    const current = resultMap.get(result.node_id) ?? { attempts: 0, correct: 0 };
    current.attempts += 1;
    current.correct += result.correct ? 1 : 0;
    resultMap.set(result.node_id, current);
  }
  const weakTopics: WeakTopic[] = Array.from(resultMap.entries())
    .filter(([, result]) => result.attempts >= 3)
    .map(([nodeId, result]) => {
      const node = getNode(nodeId);
      return { nodeId, title: node?.title ?? nodeId, pathId: node?.pathId ?? '', accuracy: Math.round(result.correct / result.attempts * 100), attempts: result.attempts };
    })
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 8);

  const timeByPath = new Map<string, number>();
  for (const event of eventRows ?? []) {
    if (event.path_id) timeByPath.set(event.path_id, (timeByPath.get(event.path_id) ?? 0) + Number(event.active_seconds ?? 0));
  }
  const paths: PathPerformance[] = LEARNING_PATHS.map((path) => {
    const nodeResults = path.nodes.map((node) => resultMap.get(node.id)).filter(Boolean) as { attempts: number; correct: number }[];
    const attempts = nodeResults.reduce((sum, item) => sum + item.attempts, 0);
    const correct = nodeResults.reduce((sum, item) => sum + item.correct, 0);
    const depthPoints = path.nodes.reduce((sum, node) => sum + (nodeDepths[node.id] ?? 0), 0);
    return {
      pathId: path.id,
      accuracy: attempts ? Math.round(correct / attempts * 100) : null,
      attempts,
      activeSeconds: timeByPath.get(path.id) ?? 0,
      masteryPercent: Math.round(depthPoints / (path.nodes.length * 3) * 100),
      averageDepth: Number((depthPoints / path.nodes.length).toFixed(1)),
    };
  }).sort((a, b) => b.masteryPercent - a.masteryPercent || (b.accuracy ?? 0) - (a.accuracy ?? 0));

  return { summary, heatmap, weeks, weakTopics, paths };
}
