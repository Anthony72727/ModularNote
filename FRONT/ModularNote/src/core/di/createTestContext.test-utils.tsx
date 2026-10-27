import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { JSX, ReactNode } from 'react'
import { AddNoteUseCaseImpl } from '../../domain/notes/interactors/AddNoteUseCaseImpl'
import { GetNoteByIdUseCaseImpl } from '../../domain/notes/interactors/GetNoteByIdUseCaseImpl'
import { GetNotesUseCaseImpl } from '../../domain/notes/interactors/GetNotesUseCaseImpl'
import type { NoteRepository } from '../../domain/notes/repositories/NoteRepository'
import type { Dependencies } from './Dependencies'
import { DependenciesProvider } from './DependenciesProvider'

/**
 * What a test needs to render a ViewModel or a component
 */
export type TestContext = {
  /** Cache of the test, to prefill it or read what was stored */
  queryClient: QueryClient
  /** Providers to give to render / renderHook as their wrapper option */
  wrapper: (props: { children: ReactNode }) => JSX.Element
}

/**
 * Providers of the application (TanStack Query + real use cases) on top of a fake repository,
 * for the tests of the ViewModels and components. Failed requests are not retried, to keep the tests fast.
 * @param noteRepository - Fake repository used by every use case
 * @returns The cache and the providers of the test
 */
export function createTestContext(noteRepository: NoteRepository): TestContext {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const dependencies: Dependencies = {
    getNotes: new GetNotesUseCaseImpl(noteRepository),
    getNoteById: new GetNoteByIdUseCaseImpl(noteRepository),
    addNote: new AddNoteUseCaseImpl(noteRepository),
  }

  function wrapper({ children }: { children: ReactNode }): JSX.Element {
    return (
      <QueryClientProvider client={queryClient}>
        <DependenciesProvider dependencies={dependencies}>{children}</DependenciesProvider>
      </QueryClientProvider>
    )
  }

  return { queryClient, wrapper }
}
