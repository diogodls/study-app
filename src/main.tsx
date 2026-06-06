import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { GameStateProvider } from '@/context/GameStateContext'
import { AuthProvider } from '@/context/AuthContext'
import './index.css'
import App from './App.tsx'

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
