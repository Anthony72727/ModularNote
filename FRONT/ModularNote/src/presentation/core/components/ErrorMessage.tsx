import type { JSX, ReactNode } from 'react'
import styles from './ErrorMessage.module.css'

/**
 * Props of ErrorMessage
 */
type ErrorMessageProps = {
  /** Message to show */
  children: ReactNode
}

/**
 * Error message announced to screen readers as soon as it appears
 * @param props - The message to show
 * @returns The message, styled as an error
 */
export function ErrorMessage({ children }: ErrorMessageProps): JSX.Element {
  return (
    <p role="alert" className={styles.error}>
      {children}
    </p>
  )
}
