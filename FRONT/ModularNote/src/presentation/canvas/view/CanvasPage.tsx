import type { JSX } from 'react'
import { Link } from 'react-router'
import { appPaths } from '../../../core/router/appPaths'
import { Button } from '../../core/components/Button'
import { ErrorMessage } from '../../core/components/ErrorMessage'
import { useCanvasViewModel } from '../viewModel/useCanvasViewModel'
import type { CanvasViewModel } from '../viewModel/useCanvasViewModel'
import { CanvasGraph } from './components/CanvasGraph'
import styles from './CanvasPage.module.css'

/**
 * Canvas page: every note and its links on a surface, with its loading, error and empty states
 * @returns The page
 */
export function CanvasPage(): JSX.Element {
  const viewModel: CanvasViewModel = useCanvasViewModel()

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
      />
    </section>
  )
}
