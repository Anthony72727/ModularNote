import type { JSX } from 'react'
import type { NotesViewModel } from '../viewModel/useNotesViewModel'
import { useNotesViewModel } from '../viewModel/useNotesViewModel'
import { NoteDetailsPanel } from './components/NoteDetailsPanel'
import { NoteForm } from './components/NoteForm'
import { NoteList } from './components/NoteList'
import styles from './NotesPage.module.css'

/**
 * Notes page: creation form on the left, list of notes on the right, details panel under the list
 */
export function NotesPage(): JSX.Element {
  const viewModel: NotesViewModel = useNotesViewModel()

  return (
    <div className={styles.page}>
      <section className={styles.formColumn} aria-labelledby="new-note-heading">
        <h2 id="new-note-heading" className={styles.heading}>
          Nouvelle idée
        </h2>
        <NoteForm />
      </section>

      <section className={styles.listColumn} aria-labelledby="notes-heading">
        <header className={styles.listHeader}>
          <h2 id="notes-heading" className={styles.heading}>
            Mes idées
          </h2>
          {!viewModel.isLoading && viewModel.loadError === null && <span className={styles.count}>{viewModel.notes.length}</span>}
        </header>

        <NoteList
          notes={viewModel.notes}
          isLoading={viewModel.isLoading}
          loadError={viewModel.loadError}
          selectedNoteId={viewModel.selectedNoteId}
          onSelect={viewModel.toggleNote}
          onRetry={viewModel.retry}
        />

        {viewModel.selectedNoteId !== null && (
          <NoteDetailsPanel noteId={viewModel.selectedNoteId} onClose={viewModel.closeNote} />
        )}
      </section>
    </div>
  )
}
