import type { JSX } from 'react'
import styles from './App.module.css'
import { NotesPage } from './presentation/notes/view/NotesPage'

export function App(): JSX.Element {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.brand}>ModularNote</h1>
      </header>
      <main className={styles.main}>
        <NotesPage />
      </main>
    </div>
  )
}
