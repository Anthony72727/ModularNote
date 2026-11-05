import type { JSX } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import type { NavLinkRenderProps } from 'react-router'
import styles from './App.module.css'
import { appPaths } from './core/router/appPaths'
import { UnsavedChangesGuard } from './presentation/core/unsavedChanges/UnsavedChangesGuard'

/**
 * Class of a navigation link, highlighted when its page is the current one
 */
function navLinkClassName({ isActive }: NavLinkRenderProps): string {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
}

/**
 * Class of the link to the creation form, the main action of the navigation
 */
function newNoteLinkClassName({ isActive }: NavLinkRenderProps): string {
  return isActive ? `${styles.newNoteLink} ${styles.newNoteLinkActive}` : styles.newNoteLink
}

/**
 * Layout of every page: header with the navigation, then the page of the current URL
 * @returns The whole page
 */
export function App(): JSX.Element {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.brand}>
          <Link to={appPaths.notes} className={styles.brandLink}>
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
              <path className={styles.logoLinks} d="M11 20 23.6 9.6M11 20l13.8 4.2" />
              <circle className={styles.logoKernel} cx="11" cy="20" r="6" />
              <circle className={styles.logoLinked} cx="24" cy="9" r="3.5" />
              <circle className={styles.logoIdea} cx="25" cy="24.5" r="3" />
            </svg>
            ModularNote
          </Link>
        </h1>
        <nav aria-label="Navigation principale">
          <ul className={styles.nav}>
            <li>
              <NavLink to={appPaths.notes} end className={navLinkClassName}>
                Liste
              </NavLink>
            </li>
            <li>
              <NavLink to={appPaths.quickAdd} className={navLinkClassName}>
                Ajout rapide
              </NavLink>
            </li>
            <li className={styles.newNoteItem}>
              <NavLink to={appPaths.newNote} className={newNoteLinkClassName}>
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className={styles.plus}>
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Nouvelle idée
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <UnsavedChangesGuard>
          <Outlet />
        </UnsavedChangesGuard>
      </main>
    </div>
  )
}
