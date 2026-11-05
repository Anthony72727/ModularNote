import type { JSX } from 'react'
import { ErrorMessage } from '../../core/components/ErrorMessage'
import type { DeleteNoteViewModel } from '../viewModel/useDeleteNoteViewModel'
import { useDeleteNoteViewModel } from '../viewModel/useDeleteNoteViewModel'
import type { NotesViewModel } from '../viewModel/useNotesViewModel'
import { useNotesViewModel } from '../viewModel/useNotesViewModel'
import { NoteDetailsPanel } from './components/NoteDetailsPanel'
import { NoteList } from './components/NoteList'
import styles from './NotesPage.module.css'

/**
 * Notes page: list of notes, details panel under the list
 * @returns The page
 */
export function NotesPage(): JSX.Element {
  const viewModel: NotesViewModel = useNotesViewModel()
  const deleteViewModel: DeleteNoteViewModel = useDeleteNoteViewModel(viewModel.deselectNote)

  return (
    <div className={styles.page}>
      <section className={styles.content} aria-labelledby="notes-heading">
        <header className={styles.header}>
          <h2 id="notes-heading" className={styles.heading}>
            Toutes les idées
          </h2>
          {!viewModel.isLoading && viewModel.loadError === null && (
            <p className={styles.count}>
              {viewModel.notes.length} {viewModel.notes.length > 1 ? 'idées' : 'idée'}
            </p>
          )}
        </header>

        {deleteViewModel.error !== null && <ErrorMessage>{deleteViewModel.error}</ErrorMessage>}

        <div className={styles.listCard}>
          <NoteList
            notes={viewModel.notes}
            isLoading={viewModel.isLoading}
            loadError={viewModel.loadError}
            selectedNoteId={viewModel.selectedNoteId}
            onSelect={viewModel.toggleNote}
            onRetry={viewModel.retry}
            onDelete={deleteViewModel.requestDeletion}
            isDeleting={deleteViewModel.isDeleting}
          />

          {viewModel.selectedNoteId !== null && (
            // One panel per note: selecting another note leaves the edition of the previous one
            <NoteDetailsPanel
              key={viewModel.selectedNoteId}
              noteId={viewModel.selectedNoteId}
              onClose={viewModel.closeNote}
              hasUnsavedEdit={viewModel.hasUnsavedEdit}
              onUnsavedEditChange={viewModel.changeHasUnsavedEdit}
            />
          )}
        </div>
      </section>
    </div>
  )
}
