import type { ButtonHTMLAttributes, JSX } from 'react'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

/**
 * Button of the design system ("button" type by default, so it never submits a form by accident)
 */
export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps): JSX.Element {
  const classNames: string = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  return <button type={type} className={classNames} {...props} />
}
