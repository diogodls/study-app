import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  keyLoading: boolean;
  hasGeminiKey: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, geminiApiKey: string) => Promise<boolean>;
  saveGeminiKey: (apiKey: string) => Promise<void>;
  deleteGeminiKey: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyLoading, setKeyLoading] = useState(true);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const refreshKeyStatus = useCallback(async () => {
    if (!session) {
      setHasGeminiKey(false);
      setKeyLoading(false);
      return;
    }
    setKeyLoading(true);
    const { data, error } = await supabase.functions.invoke<{ hasKey?: boolean }>('gemini-proxy', {
      body: { action: 'key-status' },
    });
    setHasGeminiKey(!error && Boolean(data?.hasKey));
    setKeyLoading(false);
  }, [session]);

  useEffect(() => {
    void refreshKeyStatus();
  }, [refreshKeyStatus]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const saveGeminiKey = useCallback(async (apiKey: string) => {
    const { error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action: 'save-key', apiKey },
    });
    if (error) throw error;
    setHasGeminiKey(true);
  }, []);

  const deleteGeminiKey = useCallback(async () => {
    const { error } = await supabase.functions.invoke('gemini-proxy', {
      body: { action: 'delete-key' },
    });
    if (error) throw error;
    setHasGeminiKey(false);
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, geminiApiKey: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.session) {
      const { error: keyError } = await supabase.functions.invoke('gemini-proxy', {
        body: { action: 'save-key', apiKey: geminiApiKey },
      });
      if (keyError) throw keyError;
      setHasGeminiKey(true);
      return true;
    }
    return false;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    loading,
    keyLoading,
    hasGeminiKey,
    signInWithEmail,
    signUpWithEmail,
    saveGeminiKey,
    deleteGeminiKey,
    signOut,
  }), [
    session,
    loading,
    keyLoading,
    hasGeminiKey,
    signInWithEmail,
    signUpWithEmail,
    saveGeminiKey,
    deleteGeminiKey,
    signOut,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
