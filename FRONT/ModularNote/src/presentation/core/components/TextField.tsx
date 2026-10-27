import { useId } from 'react'
import type { ChangeEvent, JSX } from 'react'
import styles from './TextField.module.css'

/**
 * Props of TextField
 */
type TextFieldProps = {
  /** Text of the label above the field */
  label: string
  /** Current value of the field */
  value: string
  /** Called on every change, with the new value */
  onChange: (value: string) => void
  /** Maximum number of characters; also shows a counter */
  maxLength?: number
  /** True for a textarea instead of a single line input */
  multiline?: boolean
  /** Text shown while the field is empty */
  placeholder?: string
  /** True to show the field as invalid */
  invalid?: boolean
  /** Small text after the label, e.g. "(facultative)" */
  hint?: string
}

/**
 * Labelled text input (or textarea when multiline), with a character counter when maxLength is set
 * @param props - Label, value and options of the field
 * @returns The label, the counter and the field
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
