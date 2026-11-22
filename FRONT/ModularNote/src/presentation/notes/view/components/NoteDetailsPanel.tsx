import { useEffect, useId, useState } from 'react'
import type { JSX } from 'react'
import { Button } from '../../../core/components/Button'
import { ErrorMessage } from '../../../core/components/ErrorMessage'
import { confirmDiscardChanges } from '../../../core/util/confirmDiscardChanges'
import { formatDate } from '../../../core/util/formatDate'
import type { Note } from '../../../../domain/notes/entity/models/Note'
import type { NoteDetailsViewModel } from '../../viewModel/useNoteDetailsViewModel'
import { useNoteDetailsViewModel } from '../../viewModel/useNoteDetailsViewModel'
import { EditNoteForm } from './EditNoteForm'
import styles from './NoteDetailsPanel.module.css'

/**
 * Where the panel is shown: under the list (bottom) or beside the canvas (side, called "Aperçu")
 */
type NoteDetailsPanelPlacement = 'bottom' | 'side'

/**
 * Props of NoteDetailsPanel
 */
type NoteDetailsPanelProps = {
  /** Id of the note to show */
  noteId: string
  /** Called when the user closes the panel (close button or Escape) */
  onClose: () => void
  /** True when the edition of the note holds unsaved modifications */
  hasUnsavedEdit: boolean
  /** Called when the edition starts or stops holding unsaved modifications, with the new state */
  onUnsavedEditChange: (hasUnsavedEdit: boolean) => void
  /** Where the panel is shown, under the list by default */
  placement?: NoteDetailsPanelPlacement
  /** Called when the user asks to delete the note, with this note; no delete action when absent */
  onDelete?: (note: Note) => void
  /** True to disable the deletion while one is being sent */
  isDeleting?: boolean
}

/**
 * Panel that shows the selected note and its linked notes, under the list or beside the canvas;
 * the note can be edited, and deleted when the page allows it, from there
 * @param props - The note to show, where to show it, and what to do when the panel is closed
 * @returns The panel
 */
export function NoteDetailsPanel({
  noteId,
  onClose,
  hasUnsavedEdit,
  onUnsavedEditChange,
  placement = 'bottom',
  onDelete,
  isDeleting = false,
}: NoteDetailsPanelProps): JSX.Element {
  const viewModel: NoteDetailsViewModel = useNoteDetailsViewModel(noteId)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const linksHeadingId: string = useId()
  const isSide: boolean = placement === 'side'
  const shownNote: Note | null = viewModel.note
  const title: JSX.Element = <h3 className={styles.title}>{viewModel.note?.title ?? 'Chargement…'}</h3>

  useEffect((): (() => void) => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') {
        return
      }
      if (!isEditing) {
        onClose()
        return
      }
      // While editing, Escape only gives up the edition: the panel stays open
      if (!hasUnsavedEdit || confirmDiscardChanges()) {
        setIsEditing(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return (): void => document.removeEventListener('keydown', handleKeyDown)
  }, [isEditing, hasUnsavedEdit, onClose])

  return (
    <aside
      className={isSide ? `${styles.panel} ${styles.side}` : styles.panel}
      aria-label={isSide ? "Aperçu de l'idée" : "Détails de l'idée"}
    >
      <header className={styles.header}>
        {isSide ? (
          <span className={styles.label}>
            <span className={styles.labelDot} aria-hidden="true" />
            Aperçu
          </span>
        ) : (
          title
        )}
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={isSide ? "Fermer l'aperçu" : 'Fermer le détail'}
        >
          ×
        </button>
      </header>
      {isSide && title}

      {isEditing && viewModel.note !== null ? (
        // Not hidden by a refresh error: what the user is typing must not be lost
        <EditNoteForm
          note={viewModel.note}
          onSaved={(): void => setIsEditing(false)}
          onCancel={(): void => setIsEditing(false)}
          onUnsavedChange={onUnsavedEditChange}
        />
      ) : (
        <>
          {viewModel.error !== null && <ErrorMessage>{viewModel.error}</ErrorMessage>}

          {viewModel.error === null && shownNote !== null && (
            <>
              <p className={styles.date}>
                Créée le{' '}
                <time dateTime={shownNote.createdAt.toISOString()}>{formatDate(shownNote.createdAt)}</time>
              </p>
              {shownNote.description === null ? (
                <p className={styles.empty}>Pas de description</p>
              ) : (
                <p className={styles.description}>{shownNote.description}</p>
              )}
              <section className={styles.links} aria-labelledby={linksHeadingId}>
                <h4 id={linksHeadingId} className={styles.linksHeading}>
                  Idées liées
                  {isSide && viewModel.linkedNotes.length > 0 && ` · ${viewModel.linkedNotes.length}`}
                </h4>
                {viewModel.isLoadingLinkedNotes && <p className={styles.empty}>Chargement…</p>}
                {viewModel.linkedNotesError !== null && <ErrorMessage>{viewModel.linkedNotesError}</ErrorMessage>}
                {!viewModel.isLoadingLinkedNotes && viewModel.linkedNotesError === null && viewModel.linkedNotes.length === 0 && (
                  <p className={styles.empty}>Aucune idée liée</p>
                )}
                {viewModel.linkedNotes.length > 0 && (
                  <ul className={styles.linksList}>
                    {viewModel.linkedNotes.map(
                      (note: Note): JSX.Element => (
                        <li key={note.id}>{note.title}</li>
                      ),
                    )}
                  </ul>
                )}
              </section>
              <div className={styles.actions}>
                <Button variant={isSide ? 'primary' : 'secondary'} onClick={(): void => setIsEditing(true)}>
                  Modifier
                </Button>
                {onDelete !== undefined && (
                  <Button variant="danger" disabled={isDeleting} onClick={(): void => onDelete(shownNote)}>
                    Supprimer
                  </Button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </aside>
  )
}
