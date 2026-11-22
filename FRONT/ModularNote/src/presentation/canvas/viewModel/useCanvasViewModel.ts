import { useQuery } from '@tanstack/react-query'
import type { QueryFunctionContext, UseQueryResult } from '@tanstack/react-query'
import type { Dependencies } from '../../../core/di/Dependencies'
import { useDependencies } from '../../../core/di/DependenciesContext'
import type { Note } from '../../../domain/notes/entity/models/Note'
import type { NoteLink } from '../../../domain/notes/entity/models/NoteLink'
import { toNoteErrorMessage } from '../../notes/util/toNoteErrorMessage'
import { noteQueryKeys } from '../../notes/viewModel/noteQueryKeys'
import { useDeleteNoteViewModel } from '../../notes/viewModel/useDeleteNoteViewModel'
import type { DeleteNoteViewModel } from '../../notes/viewModel/useDeleteNoteViewModel'
import { computeCanvasLayout } from '../util/computeCanvasLayout'
import type { CanvasPosition } from '../util/computeCanvasLayout'

/**
 * State and actions of the canvas
 */
export type CanvasViewModel = {
  /** Every note to show */
  notes: Note[]
  /** Links between the shown notes */
  links: NoteLink[]
  /** Position computed for every note, by id */
  positions: Record<string, CanvasPosition>
  /** True until the notes and the links are loaded */
  isLoading: boolean
  /** Message to show instead of the canvas, null when the notes and the links were loaded */
  loadError: string | null
  /** Message to show when the last deletion failed, null otherwise */
  deletionError: string | null
  /** True while a deletion is being sent */
  isDeleting: boolean
  /** Ask for a confirmation, then delete the note (receives the note) */
  requestDeletion: (note: Note) => void
  /** Load again what could not be loaded */
  retry: () => void
}

/**
 * Nothing to close when a note is removed: the canvas only reads the cache, which is already updated
 */
function ignoreRemovedNote(): void {}

/**
 * ViewModel of the canvas: the positions are only computed here, nothing about them is saved
 * @returns The state of the canvas and the actions the view can call
 */
export function useCanvasViewModel(): CanvasViewModel {
  const { getNotes, getLinks }: Dependencies = useDependencies()
  const notesQuery: UseQueryResult<Note[], Error> = useQuery({
    queryKey: noteQueryKeys.all,
    queryFn: ({ signal }: QueryFunctionContext): Promise<Note[]> => getNotes.execute(signal),
  })
  const linksQuery: UseQueryResult<NoteLink[], Error> = useQuery({
    queryKey: noteQueryKeys.allLinks,
    queryFn: ({ signal }: QueryFunctionContext): Promise<NoteLink[]> => getLinks.execute(signal),
  })
  const deleteViewModel: DeleteNoteViewModel = useDeleteNoteViewModel(ignoreRemovedNote)

  const notes: Note[] = notesQuery.data ?? []
  const noteIds: Set<string> = new Set(notes.map((note: Note): string => note.id))
  // A deleted note leaves the cache before its links are read again
  const links: NoteLink[] = (linksQuery.data ?? []).filter(
    (link: NoteLink): boolean => noteIds.has(link.noteAId) && noteIds.has(link.noteBId),
  )
  const failedQuery: UseQueryResult<unknown, Error> | undefined = [notesQuery, linksQuery].find(
    (query: UseQueryResult<unknown, Error>): boolean => query.isError,
  )

  function retry(): void {
    if (notesQuery.isError) {
      void notesQuery.refetch()
    }
    if (linksQuery.isError) {
      void linksQuery.refetch()
    }
  }

  return {
    notes,
    links,
    positions: computeCanvasLayout(notes, links),
    isLoading: notesQuery.isPending || linksQuery.isPending,
    loadError: failedQuery === undefined ? null : toNoteErrorMessage(failedQuery.error),
    deletionError: deleteViewModel.error,
    isDeleting: deleteViewModel.isDeleting,
    requestDeletion: deleteViewModel.requestDeletion,
    retry,
  }
}
