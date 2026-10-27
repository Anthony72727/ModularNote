import type { ButtonHTMLAttributes, JSX } from 'react'
import styles from './Button.module.css'

/**
 * Look of a button: primary for the main action, secondary for the others
 */
type ButtonVariant = 'primary' | 'secondary'

/**
 * Props of Button: every attribute of a native button, plus its look
 */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Look of the button, primary by default */
  variant?: ButtonVariant
}

/**
 * Button of the design system ("button" type by default, so it never submits a form by accident)
 * @param props - Look of the button and attributes given to the native button
 * @returns The button
 */
export function Button({ variant = 'primary', className, type = 'button', ...props }: ButtonProps): JSX.Element {
  const classNames: string = [styles.button, styles[variant], className].filter(Boolean).join(' ')
  return <button type={type} className={classNames} {...props} />
}
