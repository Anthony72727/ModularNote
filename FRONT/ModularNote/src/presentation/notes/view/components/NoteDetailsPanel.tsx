import { useEffect, useState } from 'react'
import type { JSX } from 'react'
import { Button } from '../../../core/components/Button'
import { ErrorMessage } from '../../../core/components/ErrorMessage'
import { formatDate } from '../../../core/util/formatDate'
import type { NoteDetailsViewModel } from '../../viewModel/useNoteDetailsViewModel'
import { useNoteDetailsViewModel } from '../../viewModel/useNoteDetailsViewModel'
import { EditNoteForm } from './EditNoteForm'
import styles from './NoteDetailsPanel.module.css'

/**
 * Props of NoteDetailsPanel
 */
type NoteDetailsPanelProps = {
  /** Id of the note to show */
  noteId: string
  /** Called when the user closes the panel (close button or Escape) */
  onClose: () => void
}

/**
 * Panel that slides up from the bottom of the list and shows the selected note, which can be edited from there
 * @param props - The note to show and what to do when the panel is closed
 * @returns The panel
 */
export function NoteDetailsPanel({ noteId, onClose }: NoteDetailsPanelProps): JSX.Element {
  const viewModel: NoteDetailsViewModel = useNoteDetailsViewModel(noteId)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  useEffect((): (() => void) => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') {
        return
      }
      // While editing, Escape only gives up the edition: the panel stays open
      if (isEditing) {
        setIsEditing(false)
      } else {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return (): void => document.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, onClose])

  return (
    <aside className={styles.panel} aria-label="Détails de l'idée">
      <header className={styles.header}>
        <h3 className={styles.title}>{viewModel.note?.title ?? 'Chargement…'}</h3>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Fermer le détail">
          ×
        </button>
      </header>

      {isEditing && viewModel.note !== null ? (
        // Not hidden by a refresh error: what the user is typing must not be lost
        <EditNoteForm
          note={viewModel.note}
          onSaved={(): void => setIsEditing(false)}
          onCancel={(): void => setIsEditing(false)}
        />
      ) : (
        <>
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
              <div>
                <Button variant="secondary" onClick={(): void => setIsEditing(true)}>
                  Modifier
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </aside>
  )
}
