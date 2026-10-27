import type { JSX, ReactNode } from 'react'
import type { Dependencies } from './Dependencies'
import { DependenciesContext } from './DependenciesContext'

/**
 * Props of DependenciesProvider
 */
type DependenciesProviderProps = {
  /** Use cases to give to the ViewModels */
  dependencies: Dependencies
  /** Components that can use the use cases */
  children: ReactNode
}

/**
 * Make the use cases available to every ViewModel under it
 * @param props - The use cases and the components that can use them
 * @returns The children, inside the dependencies context
 */
export function DependenciesProvider({ dependencies, children }: DependenciesProviderProps): JSX.Element {
  return <DependenciesContext value={dependencies}>{children}</DependenciesContext>
}
