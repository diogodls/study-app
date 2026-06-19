import { supabase } from '@/services/supabaseClient';
import { getOfflineQueue, markOfflineActionFailed, removeOfflineAction, type OfflineAction } from '@/services/offlineStorageService';

async function syncAction(action: OfflineAction, userId: string) {
  const payload = action.payload;
  switch (action.type) {
    case 'quiz_result':
      return supabase.from('user_quiz_results').insert({ ...payload, user_id: userId });
    case 'note':
      return supabase.from('user_content_notes').upsert({ ...payload, user_id: userId }, { onConflict: 'user_id,context_id,content_type' });
    case 'study_event':
      return supabase.from('user_study_events').upsert({ ...payload, user_id: userId }, { onConflict: 'user_id,event_key', ignoreDuplicates: true });
    case 'lab_completion':
      return supabase.from('user_node_depths').upsert({ ...payload, user_id: userId, deepen_lab_completed: true }, { onConflict: 'user_id,node_id' });
    case 'depth_completion':
      return supabase.rpc('sync_offline_depth', payload);
    case 'streak':
      return supabase.rpc('record_study_day', payload);
  }
}

export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  if (!navigator.onLine) return { synced: 0, failed: 0 };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { synced: 0, failed: 0 };
  let synced = 0;
  let failed = 0;
  for (const action of await getOfflineQueue()) {
    try {
      const result = await syncAction(action, data.user.id);
      if (result.error) throw result.error;
      await removeOfflineAction(action.id);
      synced += 1;
    } catch (error) {
      failed += 1;
      await markOfflineActionFailed(action, error instanceof Error ? error.message : 'Sync failed');
      break;
    }
  }
  window.dispatchEvent(new CustomEvent('devquest-offline-queue'));
  return { synced, failed };
}
