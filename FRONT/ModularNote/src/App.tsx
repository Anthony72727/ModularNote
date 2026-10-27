import type { JSX } from 'react'
import { NavLink, Outlet } from 'react-router'
import type { NavLinkRenderProps } from 'react-router'
import styles from './App.module.css'
import { appPaths } from './core/router/appPaths'

/**
 * Class of a navigation link, highlighted when its page is the current one
 */
function navLinkClassName({ isActive }: NavLinkRenderProps): string {
  return isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
}

/**
 * Layout of every page: header with the navigation, then the page of the current URL
 * @returns The whole page
 */
export function App(): JSX.Element {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.brand}>ModularNote</h1>
        <nav aria-label="Navigation principale">
          <ul className={styles.nav}>
            <li>
              <NavLink to={appPaths.notes} end className={navLinkClassName}>
                Mes idées
              </NavLink>
            </li>
            <li>
              <NavLink to={appPaths.quickAdd} className={navLinkClassName}>
                Ajout rapide
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
