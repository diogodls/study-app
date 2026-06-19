import { getCachedContent, saveCachedContent } from '@/services/contentCacheService';
import { generateSkillAssessment } from '@/services/geminiService';
import { supabase } from '@/services/supabaseClient';
import type { CheatSheetSession, ContentLanguage } from '@/types';

export async function getAssessment(pathId: string, topic: string, model: string, language: ContentLanguage) {
  const cacheId = `assessment:${pathId}`;
  const cached = await getCachedContent<CheatSheetSession>(cacheId, 0, 'assessment', model);
  if (cached) return cached;
  const generated = await generateSkillAssessment(topic, model, language);
  await saveCachedContent(cacheId, 0, 'assessment', model, generated);
  return generated;
}

export async function getAssessmentStatuses() {
  const { data } = await supabase.from('user_path_assessments').select('path_id,attempts,best_score,passed');
  return new Map((data ?? []).map((row) => [row.path_id, row]));
}

export async function completeAssessment(pathId: string, score: number, nodeIds: string[]) {
  const { data, error } = await supabase.rpc('complete_path_assessment', {
    p_path_id: pathId,
    p_score: score,
    p_node_ids: nodeIds,
  });
  if (error) throw error;
  return data?.[0] as { passed: boolean; attempts: number; best_score: number };
}
