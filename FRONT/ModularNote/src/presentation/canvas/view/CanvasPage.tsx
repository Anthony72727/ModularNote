import type { JSX } from 'react'
import { Link } from 'react-router'
import { appPaths } from '../../../core/router/appPaths'
import { Button } from '../../core/components/Button'
import { ErrorMessage } from '../../core/components/ErrorMessage'
import { NoteDetailsPanel } from '../../notes/view/components/NoteDetailsPanel'
import { useSelectedNoteViewModel } from '../../notes/viewModel/useSelectedNoteViewModel'
import type { SelectedNoteViewModel } from '../../notes/viewModel/useSelectedNoteViewModel'
import { useCanvasViewModel } from '../viewModel/useCanvasViewModel'
import type { CanvasViewModel } from '../viewModel/useCanvasViewModel'
import { CanvasGraph } from './components/CanvasGraph'
import styles from './CanvasPage.module.css'

/**
 * Canvas page: every note and its links on a surface, with its loading, error and empty states; a click on a note
 * opens its preview beside the surface
 * @returns The page
 */
export function CanvasPage(): JSX.Element {
  const previewViewModel: SelectedNoteViewModel = useSelectedNoteViewModel()
  const viewModel: CanvasViewModel = useCanvasViewModel(previewViewModel.deselectNote)

  if (viewModel.isLoading) {
    return <p className={styles.state}>Chargement du canvas…</p>
  }

  if (viewModel.loadError !== null) {
    return (
      <div className={styles.state}>
        <ErrorMessage>{viewModel.loadError}</ErrorMessage>
        <Button variant="secondary" onClick={viewModel.retry}>
          Réessayer
        </Button>
      </div>
    )
  }

  if (viewModel.notes.length === 0) {
    return (
      <div className={styles.state}>
        <p>Le canvas est vide : créez une première idée pour le remplir.</p>
        <Link to={appPaths.newNote} className={styles.addLink}>
          Créer une première idée
        </Link>
      </div>
    )
  }

  return (
    <section className={styles.page} aria-label="Canvas des idées">
      <div className={styles.surface}>
        {viewModel.deletionError !== null && (
          <div className={styles.error}>
            <ErrorMessage>{viewModel.deletionError}</ErrorMessage>
          </div>
        )}
        <CanvasGraph
          notes={viewModel.notes}
          links={viewModel.links}
          positions={viewModel.positions}
          isDeleting={viewModel.isDeleting}
          onDelete={viewModel.requestDeletion}
          previewedNoteId={previewViewModel.selectedNoteId}
          onTogglePreview={previewViewModel.toggleNote}
          onClosePreview={previewViewModel.closeNote}
        />
      </div>
      {previewViewModel.selectedNoteId !== null && (
        // One panel per note: previewing another note leaves the edition of the previous one
        <NoteDetailsPanel
          key={previewViewModel.selectedNoteId}
          noteId={previewViewModel.selectedNoteId}
          placement="side"
          onClose={previewViewModel.closeNote}
          hasUnsavedEdit={previewViewModel.hasUnsavedEdit}
          onUnsavedEditChange={previewViewModel.changeHasUnsavedEdit}
          onDelete={viewModel.requestDeletion}
          isDeleting={viewModel.isDeleting}
        />
      )}
    </section>
  )
}
