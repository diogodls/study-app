import { supabase } from '@/services/supabaseClient';
import { getOfflineNote, queueOfflineAction, saveOfflineNote } from '@/services/offlineStorageService';

export type NoteContentType = 'lesson' | 'lab';

export async function getContentNote(
  contextId: string,
  contentType: NoteContentType,
): Promise<string> {
  const key = `${contextId}:${contentType}`;
  if (!navigator.onLine) return getOfflineNote(key);
  const { data } = await supabase
    .from('user_content_notes')
    .select('note')
    .eq('context_id', contextId)
    .eq('content_type', contentType)
    .maybeSingle();

  const note = data?.note ?? await getOfflineNote(key);
  await saveOfflineNote(key, note);
  return note;
}

export async function saveContentNote(
  contextId: string,
  contentType: NoteContentType,
  note: string,
): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('User not authenticated');
  const updatedAt = new Date().toISOString();
  const key = `${contextId}:${contentType}`;
  await saveOfflineNote(key, note);
  const payload = { context_id: contextId, content_type: contentType, note, updated_at: updatedAt };
  if (!navigator.onLine) {
    await queueOfflineAction('note', payload, `note:${key}`);
    return;
  }

  const { error } = await supabase.from('user_content_notes').upsert({ user_id: data.user.id, ...payload });
  if (error) await queueOfflineAction('note', payload, `note:${key}`);
}
