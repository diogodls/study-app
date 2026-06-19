import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { GameStateProvider } from '@/context/GameStateContext'
import { AuthProvider } from '@/context/AuthContext'
import './index.css'
import App from './App.tsx'
import { applyTheme } from '@/services/themeService'

const storedState = localStorage.getItem('devquest_state_v2');
const storedTheme = storedState ? JSON.parse(storedState).theme ?? 'system' : 'system';
applyTheme(storedTheme);

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
