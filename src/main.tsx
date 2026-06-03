import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { GameStateProvider } from '@/context/GameStateContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <GameStateProvider>
        <App />
      </GameStateProvider>
    </HashRouter>
  </StrictMode>,
)
