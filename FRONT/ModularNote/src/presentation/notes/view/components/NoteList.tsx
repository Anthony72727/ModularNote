import type { JSX } from 'react'
import { Button } from '../../../core/components/Button'
import { ErrorMessage } from '../../../core/components/ErrorMessage'
import { formatDate } from '../../../core/util/formatDate'
import type { Note } from '../../../../domain/notes/entity/models/Note'
import styles from './NoteList.module.css'

type NoteListProps = {
  notes: Note[]
  isLoading: boolean
  loadError: string | null
  selectedNoteId: string | null
  onSelect: (id: string) => void
  onRetry: () => void
}

/**
 * Keep the selected note visible when the details panel opens under the list
 */
function scrollIntoView(element: HTMLButtonElement | null): void {
  element?.scrollIntoView({ block: 'nearest' })
}

/**
 * List of the notes, with its loading, error and empty states; a click on a note toggles its details
 */
export function NoteList({ notes, isLoading, loadError, selectedNoteId, onSelect, onRetry }: NoteListProps): JSX.Element {
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
      <p className={styles.state}>Aucune idée pour l'instant. Crée ta première note avec le formulaire.</p>
    )
  }

  return (
    <ul className={styles.list}>
      {notes.map((note: Note): JSX.Element => {
        const isSelected: boolean = note.id === selectedNoteId
        return (
          <li key={note.id}>
            <button
              type="button"
              className={isSelected ? `${styles.item} ${styles.selected}` : styles.item}
              aria-expanded={isSelected}
              onClick={(): void => onSelect(note.id)}
              ref={isSelected ? scrollIntoView : undefined}
            >
              <span className={styles.title}>{note.title}</span>
              <span className={note.description === null ? `${styles.excerpt} ${styles.empty}` : styles.excerpt}>
                {note.description ?? 'Pas de description'}
              </span>
              <time className={styles.date} dateTime={note.createdAt.toISOString()}>
                {formatDate(note.createdAt)}
              </time>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
