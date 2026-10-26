import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, QueryFunctionContext, UseQueryResult } from '@tanstack/react-query'
import type { Dependencies } from '../../../core/di/Dependencies'
import { useDependencies } from '../../../core/di/DependenciesContext'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { toNoteErrorMessage } from '../util/toNoteErrorMessage'
import { noteQueryKeys } from './noteQueryKeys'

/**
 * Number of new attempts after a failure (a missing note is never retried)
 */
const MAX_RETRIES: number = 3

export type NoteDetailsViewModel = {
  note: Note | null
  error: string | null
}

/**
 * ViewModel of the details panel: shows the note from the list right away, then refreshes it from the API
 */
export function useNoteDetailsViewModel(noteId: string): NoteDetailsViewModel {
  const { getNoteById }: Dependencies = useDependencies()
  const queryClient: QueryClient = useQueryClient()

  const noteQuery: UseQueryResult<Note, Error> = useQuery({
    queryKey: noteQueryKeys.detail(noteId),
    queryFn: ({ signal }: QueryFunctionContext): Promise<Note> => getNoteById.execute(noteId, signal),
    placeholderData: (): Note | undefined =>
      queryClient.getQueryData<Note[]>(noteQueryKeys.all)?.find((note: Note): boolean => note.id === noteId),
    retry: (failureCount: number, error: Error): boolean =>
      !(error instanceof NoteNotFoundError) && failureCount < MAX_RETRIES,
  })

  return {
    note: noteQuery.data ?? null,
    error: noteQuery.isError ? toNoteErrorMessage(noteQuery.error) : null,
  }
}
