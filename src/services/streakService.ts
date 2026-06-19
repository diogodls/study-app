import { supabase } from '@/services/supabaseClient';

export async function recordStudyDay(eventKey: string, occurredAt = new Date().toISOString()) {
  const { data, error } = await supabase.rpc('record_study_day', {
    p_event_key: eventKey,
    p_occurred_at: occurredAt,
  });
  if (error) throw error;
  return data?.[0] as { streak: number; longest_streak: number; last_study_date: string } | undefined;
}
