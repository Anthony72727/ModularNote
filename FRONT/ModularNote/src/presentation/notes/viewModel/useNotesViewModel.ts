import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { QueryFunctionContext, UseQueryResult } from '@tanstack/react-query'
import type { Dependencies } from '../../../core/di/Dependencies'
import { useDependencies } from '../../../core/di/DependenciesContext'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { toNoteErrorMessage } from '../util/toNoteErrorMessage'
import { noteQueryKeys } from './noteQueryKeys'

export type NotesViewModel = {
  notes: Note[]
  isLoading: boolean
  loadError: string | null
  /** Note whose details are open, null when the panel is closed */
  selectedNoteId: string | null
  retry: () => void
  toggleNote: (id: string) => void
  closeNote: () => void
}

/**
 * ViewModel of the notes page: the list of notes (newest first) and the selected note
 */
export function useNotesViewModel(): NotesViewModel {
  const { getNotes }: Dependencies = useDependencies()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)

  const notesQuery: UseQueryResult<Note[], Error> = useQuery({
    queryKey: noteQueryKeys.all,
    queryFn: ({ signal }: QueryFunctionContext): Promise<Note[]> => getNotes.execute(signal),
  })

  const notes: Note[] = [...(notesQuery.data ?? [])].sort(
    (first: Note, second: Note): number => second.createdAt.getTime() - first.createdAt.getTime(),
  )

  function retry(): void {
    void notesQuery.refetch()
  }

  function toggleNote(id: string): void {
    setSelectedNoteId((current: string | null): string | null => (current === id ? null : id))
  }

  function closeNote(): void {
    setSelectedNoteId(null)
  }

  return {
    notes,
    isLoading: notesQuery.isPending,
    loadError: notesQuery.isError ? toNoteErrorMessage(notesQuery.error) : null,
    selectedNoteId,
    retry,
    toggleNote,
    closeNote,
  }
}
