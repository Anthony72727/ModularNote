import { useId } from 'react'
import type { ChangeEvent, JSX, KeyboardEvent } from 'react'
import { ErrorMessage } from '../../../core/components/ErrorMessage'
import type { Note } from '../../../../domain/notes/entity/models/Note'
import type { LinkedNoteSearchViewModel } from '../../viewModel/useLinkedNoteSearchViewModel'
import { useLinkedNoteSearchViewModel } from '../../viewModel/useLinkedNoteSearchViewModel'
import styles from './LinkedNotesField.module.css'

/**
 * Props of LinkedNotesField
 */
type LinkedNotesFieldProps = {
  /** Notes already chosen */
  linkedNotes: Note[]
  /** Called when the user chooses a note, with this note */
  onAdd: (note: Note) => void
  /** Called when the user gives up a chosen note, with its id */
  onRemove: (id: string) => void
}

/**
 * Field that chooses existing notes by searching their title; a chosen note can be given up
 * @param props - The chosen notes and what to do when the choice changes
 * @returns The search field, the proposed notes and the chosen notes
 */
export function LinkedNotesField({ linkedNotes, onAdd, onRemove }: LinkedNotesFieldProps): JSX.Element {
  const viewModel: LinkedNoteSearchViewModel = useLinkedNoteSearchViewModel(
    linkedNotes.map((note: Note): string => note.id),
  )
  const searchId: string = useId()

  function choose(note: Note): void {
    onAdd(note)
    viewModel.changeSearch('')
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    viewModel.changeSearch(event.target.value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    // While an accent or an IME character is being composed, Enter validates the character
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return
    }
    // In this field, Enter chooses the first proposed note instead of creating the note
    event.preventDefault()
    if (viewModel.suggestions.length > 0) {
      choose(viewModel.suggestions[0])
    }
  }

  return (
    <div className={styles.field}>
      <label htmlFor={searchId} className={styles.label}>
        Lier à d'autres idées{linkedNotes.length > 0 && ` · ${linkedNotes.length}`}
      </label>

      {linkedNotes.length > 0 && (
        <ul className={styles.chosen} aria-label="Idées choisies">
          {linkedNotes.map(
            (note: Note): JSX.Element => (
              <li key={note.id} className={styles.chip}>
                <span className={styles.chipTitle}>{note.title}</span>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Retirer l'idée "${note.title}"`}
                  onClick={(): void => onRemove(note.id)}
                >
                  ×
                </button>
              </li>
            ),
          )}
        </ul>
      )}

      <div className={styles.search}>
        <div className={styles.searchRow}>
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="6" />
            <path d="M20 20l-4.5-4.5" />
          </svg>
          <input
            id={searchId}
            className={styles.searchInput}
            type="text"
            value={viewModel.search}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Chercher une idée à lier…"
          />
        </div>

        {viewModel.suggestions.length > 0 && (
          <ul className={styles.suggestions} aria-label="Idées proposées">
            {viewModel.suggestions.map(
              (note: Note): JSX.Element => (
                <li key={note.id}>
                  <button type="button" className={styles.suggestion} onClick={(): void => choose(note)}>
                    {note.title}
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      {viewModel.error !== null && <ErrorMessage>{viewModel.error}</ErrorMessage>}
      {viewModel.hasNoResult && <p className={styles.notice}>Aucune idée trouvée.</p>}
      {viewModel.hasMoreSuggestions && (
        <p className={styles.notice}>Affine ta recherche pour voir les autres idées.</p>
      )}
    </div>
  )
}
