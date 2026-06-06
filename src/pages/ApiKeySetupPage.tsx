import { useCallback, useState } from 'react';
import { KeyRound, Loader, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ApiKeySetupPage() {
  const { saveGeminiKey, signOut } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const save = useCallback(async () => {
    const value = apiKey.trim();
    if (value.length < 20) {
      setError('Insira uma chave válida da API Gemini.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await saveGeminiKey(value);
      setApiKey('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a chave.');
    } finally {
      setLoading(false);
    }
  }, [apiKey, saveGeminiKey]);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <img src="/devquest-icon.svg" alt="" className="auth-logo" />
        <h1>Conectar Gemini</h1>
        <p className="auth-subtitle">
          Insira sua chave pessoal. Ela será criptografada no servidor e usada somente nas suas solicitações.
        </p>
        <div className="input-group">
          <label className="input-label" htmlFor="gemini-key-input">Chave da API Gemini</label>
          <input
            id="gemini-key-input"
            className="input"
            type="password"
            value={apiKey}
            autoComplete="off"
            onChange={(event) => setApiKey(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && save()}
          />
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button className="btn btn-primary btn-3d btn-full" disabled={loading} onClick={save}>
          {loading ? <><Loader size={16} className="animate-spin" /> Salvando...</> : <><KeyRound size={16} /> Salvar chave</>}
        </button>
        <button className="btn btn-secondary btn-full" disabled={loading} onClick={signOut}>
          <LogOut size={16} /> Sair
        </button>
      </div>
    </div>
  );
}
