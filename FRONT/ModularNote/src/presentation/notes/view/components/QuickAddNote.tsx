import type { ChangeEvent, JSX, KeyboardEvent } from 'react'
import { ErrorMessage } from '../../../core/components/ErrorMessage'
import { formatDate } from '../../../core/util/formatDate'
import { NOTE_TITLE_MAX_LENGTH } from '../../../../domain/notes/entity/models/Note'
import type { Note } from '../../../../domain/notes/entity/models/Note'
import type { AddNoteViewModel } from '../../viewModel/useAddNoteViewModel'
import { useAddNoteViewModel } from '../../viewModel/useAddNoteViewModel'
import styles from './QuickAddNote.module.css'

/**
 * Single line field that creates a note from its title when the user presses Enter,
 * followed by the notes just added
 * @returns The field, its error and the recent notes
 */
export function QuickAddNote(): JSX.Element {
  const viewModel: AddNoteViewModel = useAddNoteViewModel()

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    viewModel.changeTitle(event.target.value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    // While an accent or an IME character is being composed, Enter validates the character, not the note
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) {
      return
    }
    event.preventDefault()
    if (!viewModel.isTitleBlank) {
      viewModel.submit()
    }
  }

  return (
    <div className={styles.quickAdd}>
      <input
        className={viewModel.error === null ? styles.field : `${styles.field} ${styles.invalid}`}
        type="text"
        value={viewModel.title}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        maxLength={NOTE_TITLE_MAX_LENGTH}
        placeholder="Nouvelle idée…"
        aria-label="Nouvelle idée"
        aria-invalid={viewModel.error !== null}
        enterKeyHint="done"
        autoComplete="off"
        autoFocus
      />
      <p className={styles.hint}>{viewModel.isSubmitting ? 'Ajout…' : 'Entrée pour ajouter'}</p>

      {viewModel.error !== null && <ErrorMessage>{viewModel.error}</ErrorMessage>}

      {viewModel.recentNotes.length > 0 && (
        <section className={styles.recent} aria-labelledby="recent-notes-heading">
          <h3 id="recent-notes-heading" className={styles.recentHeading}>
            Ajoutées à l'instant
          </h3>
          <ul className={styles.recentList}>
            {viewModel.recentNotes.map(
              (note: Note): JSX.Element => (
                <li key={note.id} className={styles.recentItem}>
                  <span className={styles.recentTitle}>{note.title}</span>
                  <time className={styles.recentDate} dateTime={note.createdAt.toISOString()}>
                    {formatDate(note.createdAt)}
                  </time>
                </li>
              ),
            )}
          </ul>
        </section>
      )}
    </div>
  )
}
