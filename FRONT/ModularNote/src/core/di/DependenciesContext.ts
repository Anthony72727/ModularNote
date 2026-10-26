import { createContext, use } from 'react'
import type { Context } from 'react'
import type { Dependencies } from './Dependencies'

export const DependenciesContext: Context<Dependencies | null> = createContext<Dependencies | null>(null)

/**
 * Give access to the use cases from a ViewModel
 */
export function useDependencies(): Dependencies {
  const dependencies: Dependencies | null = use(DependenciesContext)
  if (dependencies === null) {
    throw new Error('useDependencies must be used inside a DependenciesProvider')
  }
  return dependencies
}
