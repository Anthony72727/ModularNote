import type { JSX, ReactNode } from 'react'
import type { Dependencies } from './Dependencies'
import { DependenciesContext } from './DependenciesContext'

type DependenciesProviderProps = {
  dependencies: Dependencies
  children: ReactNode
}

/**
 * Make the use cases available to every ViewModel under it
 */
export function DependenciesProvider({ dependencies, children }: DependenciesProviderProps): JSX.Element {
  return <DependenciesContext value={dependencies}>{children}</DependenciesContext>
}
