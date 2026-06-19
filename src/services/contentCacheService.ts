import { supabase } from '@/services/supabaseClient';

type ContentType = 'lesson' | 'lab' | 'master' | 'flashcards' | 'review' | 'daily-challenge' | 'assessment';
type NodeDepthCache = 0 | 1 | 2 | 3;

export async function getCachedContent<T>(
  nodeId: string,
  depth: NodeDepthCache,
  contentType: ContentType,
  model: string,
): Promise<T | null> {
  const { data, error } = await supabase
    .from('user_generated_content')
    .select('content')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .eq('node_id', nodeId)
    .eq('depth', depth)
    .eq('content_type', contentType)
    .eq('model', model)
    .maybeSingle();

  if (error) return null;
  return (data?.content as T | undefined) ?? null;
}

export async function saveCachedContent<T>(
  nodeId: string,
  depth: NodeDepthCache,
  contentType: ContentType,
  model: string,
  content: T,
): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return;

  const { error } = await supabase.from('user_generated_content').upsert({
    user_id: userData.user.id,
    node_id: nodeId,
    depth,
    content_type: contentType,
    model,
    content,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,node_id,depth,content_type,model' });

  if (error) console.warn('Unable to cache generated content:', error.message);
}
