import { getNode, getNodeTopic } from '@/config/paths';
import { supabase } from '@/services/supabaseClient';
import type { NodeDepth, NodeDepthMode } from '@/types';

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export type SrsEntry = {
  nodeId: string;
  depth: NodeDepth;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  repetitionCount: number;
};

export type DueReview = SrsEntry & {
  title: string;
  icon: string;
  accuracy: number | null;
  attempts: number;
  overdueDays: number;
  weakQuestionHints: string[];
};

type ScheduleRow = {
  node_id: string;
  depth: NodeDepth | null;
  ease_factor: number | string;
  interval_days: number;
  next_review_date: string;
  repetition_count: number;
};

type QuizResultRow = {
  node_id: string;
  question_hash: string;
  correct: boolean;
};

const RATING_QUALITY: Record<SrsRating, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T00:00:00Z`).getTime();
  const to = new Date(`${toDate}T00:00:00Z`).getTime();
  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

export function computeNextSrsEntry(
  current: SrsEntry | null,
  rating: SrsRating,
  depth: NodeDepth,
): SrsEntry {
  const quality = RATING_QUALITY[rating];
  const currentEase = current?.easeFactor ?? 2.5;
  const currentRepetitions = current?.repetitionCount ?? 0;
  const nextEase = Math.max(
    1.3,
    currentEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (quality < 3) {
    return {
      nodeId: current?.nodeId ?? '',
      depth,
      easeFactor: nextEase,
      intervalDays: 1,
      nextReviewDate: addDays(1),
      repetitionCount: 0,
    };
  }

  const nextRepetitions = currentRepetitions + 1;
  const depthMultiplier = depth >= 3 ? 1.35 : depth >= 2 ? 1.15 : 1;
  const ratingMultiplier = rating === 'hard' ? 0.8 : rating === 'easy' ? 1.3 : 1;
  const intervalDays =
    nextRepetitions === 1
      ? 1
      : nextRepetitions === 2
        ? 6
        : Math.max(
            1,
            Math.round((current?.intervalDays ?? 6) * nextEase * depthMultiplier * ratingMultiplier),
          );

  return {
    nodeId: current?.nodeId ?? '',
    depth,
    easeFactor: nextEase,
    intervalDays,
    nextReviewDate: addDays(intervalDays),
    repetitionCount: nextRepetitions,
  };
}

async function getCurrentSchedule(userId: string, nodeId: string): Promise<SrsEntry | null> {
  const { data } = await supabase
    .from('user_srs_schedule')
    .select('node_id,depth,ease_factor,interval_days,next_review_date,repetition_count')
    .eq('user_id', userId)
    .eq('node_id', nodeId)
    .maybeSingle<ScheduleRow>();

  if (!data) return null;
  return {
    nodeId: data.node_id,
    depth: data.depth ?? 1,
    easeFactor: Number(data.ease_factor),
    intervalDays: data.interval_days,
    nextReviewDate: data.next_review_date,
    repetitionCount: data.repetition_count,
  };
}

export async function recordSrsReview(
  nodeId: string,
  depth: NodeDepth,
  rating: SrsRating,
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const current = await getCurrentSchedule(userData.user.id, nodeId);
  const next = computeNextSrsEntry(current, rating, depth);
  const { error } = await supabase.from('user_srs_schedule').upsert(
    {
      user_id: userData.user.id,
      node_id: nodeId,
      depth,
      ease_factor: next.easeFactor,
      interval_days: next.intervalDays,
      next_review_date: next.nextReviewDate,
      repetition_count: next.repetitionCount,
      last_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,node_id' },
  );

  if (error) console.warn('Unable to save SRS schedule:', error.message);
}

export function upsertSrsSchedule(
  nodeId: string,
  passed: boolean,
  depth: NodeDepth,
): Promise<void> {
  return recordSrsReview(nodeId, depth, passed ? 'good' : 'again');
}

export async function getDueReviews(limit = 12): Promise<DueReview[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const today = new Date().toISOString().slice(0, 10);
  const { data: schedules, error } = await supabase
    .from('user_srs_schedule')
    .select('node_id,depth,ease_factor,interval_days,next_review_date,repetition_count')
    .eq('user_id', userData.user.id)
    .lte('next_review_date', today)
    .order('next_review_date', { ascending: true })
    .limit(limit);

  if (error || !schedules?.length) return [];

  const nodeIds = schedules.map((row) => row.node_id);
  const { data: quizRows } = await supabase
    .from('user_quiz_results')
    .select('node_id,question_hash,correct')
    .eq('user_id', userData.user.id)
    .in('node_id', nodeIds)
    .order('answered_at', { ascending: false })
    .limit(250);

  const results = (quizRows ?? []) as QuizResultRow[];
  return (schedules as ScheduleRow[])
    .map((schedule) => {
      const node = getNode(schedule.node_id);
      if (!node) return null;

      const nodeResults = results.filter((result) => result.node_id === schedule.node_id);
      const correctCount = nodeResults.filter((result) => result.correct).length;
      const weakQuestionHints = Array.from(new Set(
        nodeResults
          .filter((result) => !result.correct)
          .map((result) => result.question_hash.split('::')[0].trim())
          .filter(Boolean),
      )).slice(0, 3);

      return {
        nodeId: schedule.node_id,
        title: node.title,
        icon: node.icon,
        depth: schedule.depth ?? 1,
        easeFactor: Number(schedule.ease_factor),
        intervalDays: schedule.interval_days,
        nextReviewDate: schedule.next_review_date,
        repetitionCount: schedule.repetition_count,
        accuracy: nodeResults.length ? Math.round((correctCount / nodeResults.length) * 100) : null,
        attempts: nodeResults.length,
        overdueDays: daysBetween(schedule.next_review_date, today),
        weakQuestionHints,
      };
    })
    .filter((review): review is DueReview => review !== null)
    .sort((left, right) => {
      const leftAccuracy = left.accuracy ?? 100;
      const rightAccuracy = right.accuracy ?? 100;
      return right.overdueDays - left.overdueDays || leftAccuracy - rightAccuracy || right.depth - left.depth;
    });
}

export function buildReviewPrompt(review: DueReview): string {
  const node = getNode(review.nodeId);
  if (!node) return review.title;
  const depthMode: NodeDepthMode = review.depth >= 3 ? 'master' : review.depth >= 2 ? 'deepen' : 'learn';
  const weakAreas = review.weakQuestionHints.length
    ? `Focus especially on these questions the learner previously missed: ${review.weakQuestionHints.join(' | ')}.`
    : 'Focus on the most important retrieval cues and common mistakes.';

  return `Create a short spaced-repetition review for "${getNodeTopic(node, depthMode)}". ${weakAreas} Keep the explanation compact and generate exactly 5 retrieval-focused questions.`;
}
