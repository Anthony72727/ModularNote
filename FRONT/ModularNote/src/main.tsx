import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { App } from './App.tsx'
import { createDependencies } from './core/di/Dependencies'
import type { Dependencies } from './core/di/Dependencies'
import { DependenciesProvider } from './core/di/DependenciesProvider'

const queryClient: QueryClient = new QueryClient()
const dependencies: Dependencies = createDependencies()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DependenciesProvider dependencies={dependencies}>
        <App />
      </DependenciesProvider>
    </QueryClientProvider>
  </StrictMode>,
)
