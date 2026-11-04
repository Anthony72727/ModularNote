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

/**
 * State of the details panel
 */
export type NoteDetailsViewModel = {
  /** Note to show, null while it is not known yet or when it cannot be loaded */
  note: Note | null
  /** Message to show when the note cannot be loaded, null otherwise */
  error: string | null
  /** Notes linked to this note, oldest first (empty while they are not known yet) */
  linkedNotes: Note[]
  /** True during the first loading of the linked notes */
  isLoadingLinkedNotes: boolean
  /** Message to show when the linked notes cannot be loaded, null otherwise */
  linkedNotesError: string | null
}

/**
 * ViewModel of the details panel: shows the note from the list right away, then refreshes it from the API,
 * and reads the notes linked to it
 * @param noteId - Id of the note to show
 * @returns The note, its linked notes and the errors to show
 */
export function useNoteDetailsViewModel(noteId: string): NoteDetailsViewModel {
  const { getNoteById, getNoteLinks }: Dependencies = useDependencies()
  const queryClient: QueryClient = useQueryClient()

  const noteQuery: UseQueryResult<Note, Error> = useQuery({
    queryKey: noteQueryKeys.detail(noteId),
    queryFn: ({ signal }: QueryFunctionContext): Promise<Note> => getNoteById.execute(noteId, signal),
    placeholderData: (): Note | undefined =>
      queryClient.getQueryData<Note[]>(noteQueryKeys.all)?.find((note: Note): boolean => note.id === noteId),
    retry: (failureCount: number, error: Error): boolean =>
      !(error instanceof NoteNotFoundError) && failureCount < MAX_RETRIES,
  })

  const linkedNotesQuery: UseQueryResult<Note[], Error> = useQuery({
    queryKey: noteQueryKeys.links(noteId),
    queryFn: ({ signal }: QueryFunctionContext): Promise<Note[]> => getNoteLinks.execute(noteId, signal),
    retry: (failureCount: number, error: Error): boolean =>
      !(error instanceof NoteNotFoundError) && failureCount < MAX_RETRIES,
  })

  return {
    note: noteQuery.data ?? null,
    error: noteQuery.isError ? toNoteErrorMessage(noteQuery.error) : null,
    linkedNotes: linkedNotesQuery.data ?? [],
    isLoadingLinkedNotes: linkedNotesQuery.isPending,
    linkedNotesError: linkedNotesQuery.isError ? toNoteErrorMessage(linkedNotesQuery.error) : null,
  }
}
