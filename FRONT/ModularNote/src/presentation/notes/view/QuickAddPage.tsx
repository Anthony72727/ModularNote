import type { JSX } from 'react'
import { Link } from 'react-router'
import { appPaths } from '../../../core/router/appPaths'
import { QuickAddNote } from './components/QuickAddNote'
import styles from './QuickAddPage.module.css'

/**
 * Quick add page: a centered field to write ideas one after the other
 * @returns The page
 */
export function QuickAddPage(): JSX.Element {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h2 className={styles.heading}>Une idée ?</h2>
        <QuickAddNote />
        <Link to={appPaths.notes} className={styles.link}>
          Voir toutes mes idées
        </Link>
      </div>
    </div>
  )
}
