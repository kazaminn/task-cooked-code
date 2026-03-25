import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ServiceProvider } from './services/ServiceProvider.tsx'
import { AppProvider } from './context/AppContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServiceProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ServiceProvider>
  </StrictMode>,
)
