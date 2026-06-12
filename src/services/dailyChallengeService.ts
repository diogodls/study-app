import { LEARNING_PATHS, getNode, getPath } from '@/config/paths';
import { supabase } from '@/services/supabaseClient';
import type { NodeDepth } from '@/types';

export type DailyChallenge = {
  date: string;
  nodeId: string;
  title: string;
  icon: string;
  depth: NodeDepth;
  attempts: number;
  completed: boolean;
  score: number | null;
  totalQuestions: number | null;
  xpAwarded: number;
  spAwarded: number;
};

export type DailyChallengeStats = {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
};

export type DailyChallengeState = {
  challenge: DailyChallenge;
  stats: DailyChallengeStats;
};

export type DailyChallengeCompletion = {
  newlyCompleted: boolean;
  xpAwarded: number;
  spAwarded: number;
  totalXp: number;
  totalSp: number;
  currentStreak: number;
  longestStreak: number;
};

type ChallengeRow = {
  challenge_date: string;
  node_id: string;
  depth: number;
  attempts: number;
  score: number | null;
  total_questions: number | null;
  xp_awarded: number;
  sp_awarded: number;
  completed_at: string | null;
};

function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function hash(value: string) {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }
  return result;
}

function mapChallenge(row: ChallengeRow): DailyChallenge {
  const node = getNode(row.node_id);
  return {
    date: row.challenge_date,
    nodeId: row.node_id,
    title: node?.title ?? 'Daily Challenge',
    icon: node?.icon ?? '⚔️',
    depth: Math.min(3, Math.max(1, row.depth)) as NodeDepth,
    attempts: row.attempts,
    completed: Boolean(row.completed_at),
    score: row.score,
    totalQuestions: row.total_questions,
    xpAwarded: row.xp_awarded,
    spAwarded: row.sp_awarded,
  };
}

export async function getOrCreateDailyChallenge(
  nodeDepths: Record<string, NodeDepth>,
  selectedPathId: string,
): Promise<DailyChallengeState> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error('Not authenticated');

  const challengeDate = today();
  const [{ data: existing, error: challengeError }, { data: stats, error: statsError }] = await Promise.all([
    supabase
      .from('user_daily_challenges')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('challenge_date', challengeDate)
      .maybeSingle(),
    supabase
      .from('user_daily_challenge_stats')
      .select('current_streak,longest_streak,total_completed')
      .eq('user_id', authData.user.id)
      .maybeSingle(),
  ]);

  if (challengeError) throw challengeError;
  if (statsError) throw statsError;

  let row = existing as ChallengeRow | null;
  if (!row) {
    const studiedNodes = Object.entries(nodeDepths)
      .filter(([, depth]) => depth >= 1)
      .map(([nodeId]) => nodeId)
      .filter((nodeId) => Boolean(getNode(nodeId)));
    const selectedPath = getPath(selectedPathId);
    const fallbackNodes = selectedPath?.nodes.length
      ? selectedPath.nodes.map((node) => node.id)
      : LEARNING_PATHS.flatMap((path) => path.nodes.slice(0, 1).map((node) => node.id));
    const candidates = studiedNodes.length ? studiedNodes : fallbackNodes;
    const nodeId = candidates[hash(`${authData.user.id}:${challengeDate}`) % candidates.length];
    const depth = Math.min(3, Math.max(1, nodeDepths[nodeId] ?? 1));

    const { data: created, error } = await supabase
      .from('user_daily_challenges')
      .upsert({
        user_id: authData.user.id,
        challenge_date: challengeDate,
        node_id: nodeId,
        depth,
      }, { onConflict: 'user_id,challenge_date' })
      .select('*')
      .single();
    if (error) throw error;
    row = created as ChallengeRow;
  }

  return {
    challenge: mapChallenge(row),
    stats: {
      currentStreak: stats?.current_streak ?? 0,
      longestStreak: stats?.longest_streak ?? 0,
      totalCompleted: stats?.total_completed ?? 0,
    },
  };
}

export async function startDailyChallenge(challengeDate: string): Promise<void> {
  const { error } = await supabase.rpc('start_daily_challenge', {
    p_challenge_date: challengeDate,
  });
  if (error) throw error;
}

export async function completeDailyChallenge(
  challengeDate: string,
  score: number,
  totalQuestions: number,
): Promise<DailyChallengeCompletion> {
  const { data, error } = await supabase.rpc('complete_daily_challenge', {
    p_challenge_date: challengeDate,
    p_score: score,
    p_total_questions: totalQuestions,
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row) throw new Error('Daily challenge completion returned no data');
  return {
    newlyCompleted: row.newly_completed,
    xpAwarded: row.xp_awarded,
    spAwarded: row.sp_awarded,
    totalXp: row.total_xp,
    totalSp: row.total_sp,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
  };
}
