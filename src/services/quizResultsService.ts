import { supabase } from '@/services/supabaseClient';
import type { NodeDepth } from '@/types';

export async function saveQuizResult(params: {
  nodeId: string;
  depth: NodeDepth;
  questionHash: string;
  correct: boolean;
  timeTakenMs: number;
}): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  const { error } = await supabase.from('user_quiz_results').insert({
    user_id: data.user.id,
    node_id: params.nodeId,
    depth: params.depth,
    question_hash: params.questionHash,
    correct: params.correct,
    time_taken_ms: params.timeTakenMs,
  });

  if (error) console.warn('Unable to save quiz result:', error.message);
}
