import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { JSX, ReactNode } from 'react'
import { AddNoteUseCase } from '../../domain/notes/interactors/AddNoteUseCase'
import { GetNoteByIdUseCase } from '../../domain/notes/interactors/GetNoteByIdUseCase'
import { GetNotesUseCase } from '../../domain/notes/interactors/GetNotesUseCase'
import type { NoteRepository } from '../../domain/notes/repositories/NoteRepository'
import type { Dependencies } from './Dependencies'
import { DependenciesProvider } from './DependenciesProvider'

export type TestContext = {
  queryClient: QueryClient
  wrapper: (props: { children: ReactNode }) => JSX.Element
}

/**
 * Providers of the application (TanStack Query + real use cases) on top of a fake repository,
 * for the tests of the ViewModels and components. Failed requests are not retried, to keep the tests fast.
 */
export function createTestContext(noteRepository: NoteRepository): TestContext {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const dependencies: Dependencies = {
    getNotes: new GetNotesUseCase(noteRepository),
    getNoteById: new GetNoteByIdUseCase(noteRepository),
    addNote: new AddNoteUseCase(noteRepository),
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
