import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { DataRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import { createDependencies } from './core/di/Dependencies'
import type { Dependencies } from './core/di/Dependencies'
import { DependenciesProvider } from './core/di/DependenciesProvider'
import { createAppRouter } from './core/router/appRoutes'

const queryClient: QueryClient = new QueryClient()
const dependencies: Dependencies = createDependencies()
const router: DataRouter = createAppRouter()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DependenciesProvider dependencies={dependencies}>
        <RouterProvider router={router} />
      </DependenciesProvider>
    </QueryClientProvider>
  </StrictMode>,
)
