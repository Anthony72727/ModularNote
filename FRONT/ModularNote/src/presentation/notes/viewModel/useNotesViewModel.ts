import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { QueryFunctionContext, UseQueryResult } from '@tanstack/react-query'
import type { Dependencies } from '../../../core/di/Dependencies'
import { useDependencies } from '../../../core/di/DependenciesContext'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { confirmDiscardChanges } from '../../core/util/confirmDiscardChanges'
import { toNoteErrorMessage } from '../util/toNoteErrorMessage'
import { noteQueryKeys } from './noteQueryKeys'

/**
 * State and actions of the notes page
 */
export type NotesViewModel = {
  /** Every note, newest first (empty while loading) */
  notes: Note[]
  /** True during the first loading of the notes */
  isLoading: boolean
  /** Message to show when the notes cannot be loaded, null otherwise */
  loadError: string | null
  /** Note whose details are open, null when the panel is closed */
  selectedNoteId: string | null
  /** True when the edition of the selected note holds unsaved modifications */
  hasUnsavedEdit: boolean
  /** Tell whether the edition of the selected note holds unsaved modifications (receives the new state) */
  changeHasUnsavedEdit: (value: boolean) => void
  /** Load the notes again after a failure */
  retry: () => void
  /**
   * Open the details of a note, or close them if this note is already open (receives the note's id);
   * unsaved modifications of the selected note must be given up first
   */
  toggleNote: (id: string) => void
  /** Close the details panel; unsaved modifications of the selected note must be given up first */
  closeNote: () => void
}

/**
 * ViewModel of the notes page: the list of notes (newest first) and the selected note
 * @returns The state of the page and the actions the view can call
 */
export function useNotesViewModel(): NotesViewModel {
  const { getNotes }: Dependencies = useDependencies()
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [hasUnsavedEdit, setHasUnsavedEdit] = useState<boolean>(false)

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
    if (hasUnsavedEdit && !confirmDiscardChanges()) {
      return
    }
    setSelectedNoteId((current: string | null): string | null => (current === id ? null : id))
  }

  function closeNote(): void {
    if (hasUnsavedEdit && !confirmDiscardChanges()) {
      return
    }
    setSelectedNoteId(null)
  }

  return {
    notes,
    isLoading: notesQuery.isPending,
    loadError: notesQuery.isError ? toNoteErrorMessage(notesQuery.error) : null,
    selectedNoteId,
    hasUnsavedEdit,
    changeHasUnsavedEdit: setHasUnsavedEdit,
    retry,
    toggleNote,
    closeNote,
  }
}
