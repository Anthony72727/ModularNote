import { useId } from 'react'
import type { ChangeEvent, JSX } from 'react'
import styles from './TextField.module.css'

type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  maxLength?: number
  multiline?: boolean
  placeholder?: string
  invalid?: boolean
  hint?: string
}

/**
 * Labelled text input (or textarea when multiline), with a character counter when maxLength is set
 */
export function TextField({
  label,
  value,
  onChange,
  maxLength,
  multiline = false,
  placeholder,
  invalid = false,
  hint,
}: TextFieldProps): JSX.Element {
  const id: string = useId()
  const fieldClassName: string = [styles.field, multiline ? styles.multiline : '', invalid ? styles.invalid : '']
    .filter(Boolean)
    .join(' ')

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void {
    onChange(event.target.value)
  }

  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {hint !== undefined && <span className={styles.hint}> {hint}</span>}
        </label>
        {maxLength !== undefined && (
          <span className={styles.counter}>
            {value.length} / {maxLength}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          id={id}
          className={fieldClassName}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-invalid={invalid}
          rows={8}
        />
      ) : (
        <input
          id={id}
          className={fieldClassName}
          type="text"
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-invalid={invalid}
        />
      )}
    </div>
  )
}
