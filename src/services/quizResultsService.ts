import { supabase } from '@/services/supabaseClient';
import type { NodeDepth } from '@/types';
import { queueOfflineAction } from '@/services/offlineStorageService';

export async function saveQuizResult(params: {
  nodeId: string;
  depth: NodeDepth;
  questionHash: string;
  correct: boolean;
  timeTakenMs: number;
}): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  const eventKey = `quiz:${params.nodeId}:${params.depth}:${crypto.randomUUID()}`;
  const payload = {
    node_id: params.nodeId,
    depth: params.depth,
    question_hash: params.questionHash,
    correct: params.correct,
    time_taken_ms: params.timeTakenMs,
    event_key: eventKey,
    answered_at: new Date().toISOString(),
  };
  if (!navigator.onLine) {
    await queueOfflineAction('quiz_result', payload, eventKey);
    return;
  }

  const { error } = await supabase.from('user_quiz_results').insert({ user_id: data.user.id, ...payload });

  if (error) await queueOfflineAction('quiz_result', payload, eventKey);
}
