import type { JSX, ReactNode } from 'react'
import styles from './ErrorMessage.module.css'

type ErrorMessageProps = {
  children: ReactNode
}

/**
 * Error message announced to screen readers as soon as it appears
 */
export function ErrorMessage({ children }: ErrorMessageProps): JSX.Element {
  return (
    <p role="alert" className={styles.error}>
      {children}
    </p>
  )
}
