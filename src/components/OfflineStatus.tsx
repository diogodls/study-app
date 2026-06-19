import { useCallback, useEffect, useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { getOfflineQueue } from '@/services/offlineStorageService';
import { syncOfflineQueue } from '@/services/offlineSyncService';

export default function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(() => {
    setOnline(navigator.onLine);
    void getOfflineQueue().then((queue) => setPending(queue.length));
  }, []);

  const sync = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    await syncOfflineQueue();
    setSyncing(false);
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
    const handleOnline = () => { refresh(); void sync(); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', refresh);
    window.addEventListener('devquest-offline-queue', refresh);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', refresh);
      window.removeEventListener('devquest-offline-queue', refresh);
    };
  }, [refresh, sync]);

  if (online && pending === 0) return null;
  return (
    <button className={`offline-status${online ? ' offline-status--pending' : ''}`} onClick={() => void sync()} disabled={!online || syncing}>
      {online ? <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> : <CloudOff size={14} />}
      {online ? `${pending} pending sync` : 'Offline'}
    </button>
  );
}
