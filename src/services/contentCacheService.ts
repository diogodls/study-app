import { supabase } from '@/services/supabaseClient';

type ContentType = 'lesson' | 'lab';

export async function getCachedContent<T>(
  nodeId: string,
  contentType: ContentType,
  model: string,
): Promise<T | null> {
  const { data, error } = await supabase
    .from('user_generated_content')
    .select('content')
    .eq('node_id', nodeId)
    .eq('content_type', contentType)
    .eq('model', model)
    .maybeSingle();

  if (error) return null;
  return (data?.content as T | undefined) ?? null;
}

export async function saveCachedContent<T>(
  nodeId: string,
  contentType: ContentType,
  model: string,
  content: T,
): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return;

  const { error } = await supabase.from('user_generated_content').upsert({
    user_id: userData.user.id,
    node_id: nodeId,
    content_type: contentType,
    model,
    content,
    updated_at: new Date().toISOString(),
  });

  if (error) console.warn('Unable to cache generated content:', error.message);
}
