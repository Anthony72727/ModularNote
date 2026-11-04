import type { JSX } from 'react'
import { Link } from 'react-router'
import { Button } from '../../../core/components/Button'
import { ErrorMessage } from '../../../core/components/ErrorMessage'
import { formatDate } from '../../../core/util/formatDate'
import { appPaths } from '../../../../core/router/appPaths'
import type { Note } from '../../../../domain/notes/entity/models/Note'
import styles from './NoteList.module.css'

/**
 * Props of NoteList
 */
type NoteListProps = {
  /** Notes to show, in display order */
  notes: Note[]
  /** True to show the loading state */
  isLoading: boolean
  /** Message to show instead of the list, null when the notes were loaded */
  loadError: string | null
  /** Note to highlight, null when none is open */
  selectedNoteId: string | null
  /** Called when the user clicks a note, with its id */
  onSelect: (id: string) => void
  /** Called when the user asks to load the notes again */
  onRetry: () => void
  /** Called when the user asks to delete a note, with this note */
  onDelete: (note: Note) => void
  /** True to disable the deletion while another one is being sent */
  isDeleting: boolean
}

/**
 * Keep the selected note visible when the details panel opens under the list
 */
function scrollIntoView(element: HTMLButtonElement | null): void {
  element?.scrollIntoView({ block: 'nearest' })
}

/**
 * List of the notes, with its loading, error and empty states; a click on a note toggles its details,
 * and each note can be deleted
 * @param props - The notes, their state and what to do on a click
 * @returns The list, or the state to show instead
 */
export function NoteList({
  notes,
  isLoading,
  loadError,
  selectedNoteId,
  onSelect,
  onRetry,
  onDelete,
  isDeleting,
}: NoteListProps): JSX.Element {
  if (isLoading) {
    return <p className={styles.state}>Chargement des idées…</p>
  }

  if (loadError !== null) {
    return (
      <div className={styles.state}>
        <ErrorMessage>{loadError}</ErrorMessage>
        <Button variant="secondary" onClick={onRetry}>
          Réessayer
        </Button>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className={styles.state}>
        <p>Aucune idée pour l'instant.</p>
        <Link to={appPaths.newNote} className={styles.addLink}>
          Ajouter une idée
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.scroll}>
      <div className={styles.columns} aria-hidden="true">
        <span className={styles.columnIdea}>Idée</span>
        <span className={styles.columnDate}>Créée</span>
        <span className={styles.columnActions} />
      </div>
      <ul className={styles.list}>
      {notes.map((note: Note): JSX.Element => {
        const isSelected: boolean = note.id === selectedNoteId
        const titleId: string = `note-title-${note.id}`
        return (
          <li key={note.id} className={isSelected ? `${styles.row} ${styles.selected}` : styles.row}>
            <button
              type="button"
              className={styles.item}
              aria-expanded={isSelected}
              onClick={(): void => onSelect(note.id)}
              ref={isSelected ? scrollIntoView : undefined}
            >
              <span id={titleId} className={styles.title}>
                {note.title}
              </span>
              <span className={note.description === null ? `${styles.excerpt} ${styles.empty}` : styles.excerpt}>
                {note.description ?? 'Pas de description'}
              </span>
              <time className={styles.date} dateTime={note.createdAt.toISOString()}>
                {formatDate(note.createdAt)}
              </time>
            </button>
            <Button
              variant="secondary"
              className={styles.delete}
              aria-describedby={titleId}
              disabled={isDeleting}
              onClick={(): void => onDelete(note)}
            >
              Supprimer
            </Button>
          </li>
        )
      })}
      </ul>
    </div>
  )
}
