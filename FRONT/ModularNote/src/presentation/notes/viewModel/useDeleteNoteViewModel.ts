import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, UseMutationResult } from '@tanstack/react-query'
import type { Dependencies } from '../../../core/di/Dependencies'
import { useDependencies } from '../../../core/di/DependenciesContext'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { confirmDeleteNote } from '../util/confirmDeleteNote'
import { toNoteErrorMessage } from '../util/toNoteErrorMessage'
import { noteQueryKeys } from './noteQueryKeys'

/**
 * State and actions of the deletion of a note
 */
export type DeleteNoteViewModel = {
  /** Message to show when the last deletion failed, null otherwise */
  error: string | null
  /** True while a deletion is being sent */
  isDeleting: boolean
  /** Ask for a confirmation, then delete the note (receives the note); ignored while a deletion is being sent */
  requestDeletion: (note: Note) => void
}

/**
 * ViewModel of the deletion of a note
 * @param onNoteRemoved - Called with the id of a note that does not exist anymore, deleted just now or earlier
 * @returns The state of the deletion and the action the view can call
 */
export function useDeleteNoteViewModel(onNoteRemoved: (id: string) => void): DeleteNoteViewModel {
  const { deleteNote }: Dependencies = useDependencies()
  const queryClient: QueryClient = useQueryClient()

  function removeNote(id: string): void {
    // First close what displays the note, so that nothing tries to read it again
    onNoteRemoved(id)
    // Every component that reads the notes from the cache is refreshed, without reloading the page
    queryClient.setQueryData<Note[]>(noteQueryKeys.all, (notes: Note[] | undefined): Note[] | undefined =>
      notes?.filter((note: Note): boolean => note.id !== id),
    )
    queryClient.removeQueries({ queryKey: noteQueryKeys.detail(id) })
  }

  const deleteNoteMutation: UseMutationResult<void, Error, string> = useMutation({
    mutationFn: (id: string): Promise<void> => deleteNote.execute(id),
    onSuccess: (_result: void, id: string): void => removeNote(id),
    onError: (error: Error, id: string): void => {
      if (error instanceof NoteNotFoundError) {
        // The note was deleted elsewhere: the list must stop showing it
        removeNote(id)
      }
    },
  })

  function requestDeletion(note: Note): void {
    if (deleteNoteMutation.isPending) {
      return
    }
    if (deleteNoteMutation.isError) {
      deleteNoteMutation.reset()
    }
    if (confirmDeleteNote(note.title)) {
      deleteNoteMutation.mutate(note.id)
    }
  }

  return {
    error: deleteNoteMutation.isError ? toNoteErrorMessage(deleteNoteMutation.error) : null,
    isDeleting: deleteNoteMutation.isPending,
    requestDeletion,
  }
}
