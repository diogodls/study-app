import { supabase } from '@/services/supabaseClient';
import { getOfflineContent, saveOfflineContent } from '@/services/offlineStorageService';

type ContentType = 'lesson' | 'lab' | 'master' | 'flashcards' | 'review' | 'daily-challenge' | 'assessment';
type NodeDepthCache = 0 | 1 | 2 | 3;
const CACHE_SCHEMA_VERSION = 3;

function cacheKey(nodeId: string, depth: NodeDepthCache, contentType: ContentType, model: string) {
  return `${CACHE_SCHEMA_VERSION}:${nodeId}:${depth}:${contentType}:${model}`;
}

export async function getCachedContent<T>(
  nodeId: string,
  depth: NodeDepthCache,
  contentType: ContentType,
  model: string,
): Promise<T | null> {
  const key = cacheKey(nodeId, depth, contentType, model);
  if (!navigator.onLine) return getOfflineContent<T>(key);
  const { data, error } = await supabase
    .from('user_generated_content')
    .select('content')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .eq('node_id', nodeId)
    .eq('depth', depth)
    .eq('content_type', contentType)
    .eq('model', model)
    .eq('schema_version', CACHE_SCHEMA_VERSION)
    .maybeSingle();

  if (error) return getOfflineContent<T>(key);
  const content = (data?.content as T | undefined) ?? null;
  if (content) await saveOfflineContent(key, `${nodeId}:${depth}`, content);
  return content;
}

export async function saveCachedContent<T>(
  nodeId: string,
  depth: NodeDepthCache,
  contentType: ContentType,
  model: string,
  content: T,
): Promise<void> {
  const key = cacheKey(nodeId, depth, contentType, model);
  await saveOfflineContent(key, `${nodeId}:${depth}`, content);
  if (!navigator.onLine) return;
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return;

  const { error } = await supabase.from('user_generated_content').upsert({
    user_id: userData.user.id,
    node_id: nodeId,
    depth,
    content_type: contentType,
    model,
    content,
    schema_version: CACHE_SCHEMA_VERSION,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,node_id,depth,content_type,model' });

  if (error) console.warn('Unable to cache generated content:', error.message);
}
