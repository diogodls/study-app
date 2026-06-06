import { supabase } from '@/services/supabaseClient';

export type NoteContentType = 'lesson' | 'lab';

export async function getContentNote(
  contextId: string,
  contentType: NoteContentType,
): Promise<string> {
  const { data } = await supabase
    .from('user_content_notes')
    .select('note')
    .eq('context_id', contextId)
    .eq('content_type', contentType)
    .maybeSingle();

  return data?.note ?? '';
}

export async function saveContentNote(
  contextId: string,
  contentType: NoteContentType,
  note: string,
): Promise<void> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('User not authenticated');

  const { error } = await supabase.from('user_content_notes').upsert({
    user_id: data.user.id,
    context_id: contextId,
    content_type: contentType,
    note,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
