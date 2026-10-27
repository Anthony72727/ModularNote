import type { JSX } from 'react'
import { Link } from 'react-router'
import { appPaths } from '../../../core/router/appPaths'
import styles from './NotFoundPage.module.css'

/**
 * Page shown when the URL matches no page
 * @returns The page, with a link back to the notes
 */
export function NotFoundPage(): JSX.Element {
  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Cette page n'existe pas</h2>
      <Link to={appPaths.notes} className={styles.link}>
        Retour à mes idées
      </Link>
    </div>
  )
}
