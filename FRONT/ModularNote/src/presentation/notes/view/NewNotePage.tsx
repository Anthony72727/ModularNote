import type { JSX } from 'react'
import { useNavigate } from 'react-router'
import type { NavigateFunction } from 'react-router'
import { appPaths } from '../../../core/router/appPaths'
import { useAllowNextNavigation } from '../../core/unsavedChanges/UnsavedChangesContext'
import { NoteForm } from './components/NoteForm'
import styles from './NewNotePage.module.css'

/**
 * Page of the full creation form; once the note is saved, or when the user gives up, the list of notes is shown
 * @returns The page
 */
export function NewNotePage(): JSX.Element {
  const navigate: NavigateFunction = useNavigate()
  const allowNextNavigation: () => void = useAllowNextNavigation()

  function goToNotes(): void {
    allowNextNavigation()
    void navigate(appPaths.notes)
  }

  return (
    <div className={styles.page}>
      <section className={styles.content} aria-labelledby="new-note-heading">
        <header className={styles.header}>
          <h2 id="new-note-heading" className={styles.heading}>
            Nouvelle idée
          </h2>
          <p className={styles.intro}>Elle apparaîtra dans la liste des idées.</p>
        </header>
        <NoteForm onCreated={goToNotes} onCancel={goToNotes} />
      </section>
    </div>
  )
}
