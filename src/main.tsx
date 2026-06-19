import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { GameStateProvider } from '@/context/GameStateContext'
import { AuthProvider } from '@/context/AuthContext'
import './index.css'
import App from './App.tsx'
import { applyTheme } from '@/services/themeService'

try {
  const storedState = localStorage.getItem('devquest_state_v2');
  applyTheme(storedState ? JSON.parse(storedState).theme ?? 'system' : 'system');
} catch {
  applyTheme('system');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <GameStateProvider>
          <App />
        </GameStateProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
