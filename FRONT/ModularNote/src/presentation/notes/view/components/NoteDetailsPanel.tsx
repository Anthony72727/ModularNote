import { useEffect } from 'react'
import type { JSX } from 'react'
import { ErrorMessage } from '../../../core/components/ErrorMessage'
import { formatDate } from '../../../core/util/formatDate'
import type { NoteDetailsViewModel } from '../../viewModel/useNoteDetailsViewModel'
import { useNoteDetailsViewModel } from '../../viewModel/useNoteDetailsViewModel'
import styles from './NoteDetailsPanel.module.css'

type NoteDetailsPanelProps = {
  noteId: string
  onClose: () => void
}

/**
 * Panel that slides up from the bottom of the list and shows the selected note
 */
export function NoteDetailsPanel({ noteId, onClose }: NoteDetailsPanelProps): JSX.Element {
  const viewModel: NoteDetailsViewModel = useNoteDetailsViewModel(noteId)

  useEffect((): (() => void) => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return (): void => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <aside className={styles.panel} aria-label="Détails de l'idée">
      <header className={styles.header}>
        <h3 className={styles.title}>{viewModel.note?.title ?? 'Chargement…'}</h3>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer le détail">
          ×
        </button>
      </header>

      {viewModel.error !== null && <ErrorMessage>{viewModel.error}</ErrorMessage>}

      {viewModel.error === null && viewModel.note !== null && (
        <>
          <p className={styles.date}>
            Créée le{' '}
            <time dateTime={viewModel.note.createdAt.toISOString()}>{formatDate(viewModel.note.createdAt)}</time>
          </p>
          {viewModel.note.description === null ? (
            <p className={styles.empty}>Pas de description</p>
          ) : (
            <p className={styles.description}>{viewModel.note.description}</p>
          )}
        </>
      )}
    </aside>
  )
}
