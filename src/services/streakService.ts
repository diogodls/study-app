import { supabase } from '@/services/supabaseClient';
import { queueOfflineAction } from '@/services/offlineStorageService';

export async function recordStudyDay(eventKey: string, occurredAt = new Date().toISOString()) {
  if (!navigator.onLine) {
    await queueOfflineAction('streak', { p_event_key: eventKey, p_occurred_at: occurredAt }, eventKey);
    return undefined;
  }
  const { data, error } = await supabase.rpc('record_study_day', {
    p_event_key: eventKey,
    p_occurred_at: occurredAt,
  });
  if (error) {
    await queueOfflineAction('streak', { p_event_key: eventKey, p_occurred_at: occurredAt }, eventKey);
    return undefined;
  }
  return data?.[0] as { streak: number; longest_streak: number; last_study_date: string } | undefined;
}
