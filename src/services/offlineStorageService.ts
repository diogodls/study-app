import { openDB, type DBSchema } from 'idb';

export type OfflineActionType = 'quiz_result' | 'note' | 'study_event' | 'lab_completion' | 'depth_completion' | 'streak';

type CachedContentRecord = {
  key: string;
  sessionKey: string;
  content: unknown;
  accessedAt: number;
};

export type OfflineAction = {
  id: string;
  type: OfflineActionType;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  error?: string;
};

interface DevQuestOfflineDb extends DBSchema {
  content: {
    key: string;
    value: CachedContentRecord;
    indexes: { accessedAt: number; sessionKey: string };
  };
  queue: {
    key: string;
    value: OfflineAction;
    indexes: { createdAt: string };
  };
  notes: {
    key: string;
    value: { key: string; note: string; updatedAt: string };
  };
}

const dbPromise = openDB<DevQuestOfflineDb>('devquest-offline-v1', 1, {
  upgrade(db) {
    const content = db.createObjectStore('content', { keyPath: 'key' });
    content.createIndex('accessedAt', 'accessedAt');
    content.createIndex('sessionKey', 'sessionKey');
    const queue = db.createObjectStore('queue', { keyPath: 'id' });
    queue.createIndex('createdAt', 'createdAt');
    db.createObjectStore('notes', { keyPath: 'key' });
  },
});

export async function getOfflineContent<T>(key: string): Promise<T | null> {
  const db = await dbPromise;
  const record = await db.get('content', key);
  if (!record) return null;
  record.accessedAt = Date.now();
  await db.put('content', record);
  return record.content as T;
}

export async function saveOfflineContent(key: string, sessionKey: string, content: unknown): Promise<void> {
  const db = await dbPromise;
  await db.put('content', { key, sessionKey, content, accessedAt: Date.now() });
  const records = await db.getAllFromIndex('content', 'accessedAt');
  const sessions = [...new Map(records.map((record) => [record.sessionKey, record.accessedAt])).entries()]
    .sort((left, right) => right[1] - left[1]);
  const expired = new Set(sessions.slice(5).map(([session]) => session));
  await Promise.all(records.filter((record) => expired.has(record.sessionKey)).map((record) => db.delete('content', record.key)));
}

export async function queueOfflineAction(type: OfflineActionType, payload: Record<string, unknown>, id?: string): Promise<void> {
  const db = await dbPromise;
  const actionId = id ?? `${type}:${crypto.randomUUID()}`;
  await db.put('queue', { id: actionId, type, payload, createdAt: new Date().toISOString(), attempts: 0 });
  window.dispatchEvent(new CustomEvent('devquest-offline-queue'));
}

export async function getOfflineQueue(): Promise<OfflineAction[]> {
  return (await dbPromise).getAllFromIndex('queue', 'createdAt');
}

export async function removeOfflineAction(id: string): Promise<void> {
  await (await dbPromise).delete('queue', id);
}

export async function markOfflineActionFailed(action: OfflineAction, error: string): Promise<void> {
  await (await dbPromise).put('queue', { ...action, attempts: action.attempts + 1, error });
}

export async function getOfflineNote(key: string): Promise<string> {
  return (await dbPromise).get('notes', key).then((record) => record?.note ?? '');
}

export async function saveOfflineNote(key: string, note: string): Promise<void> {
  await (await dbPromise).put('notes', { key, note, updatedAt: new Date().toISOString() });
}
