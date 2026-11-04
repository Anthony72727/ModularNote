import type { FormEvent, JSX, ReactNode } from 'react'
import { Button } from '../../../core/components/Button'
import { ErrorMessage } from '../../../core/components/ErrorMessage'
import { TextField } from '../../../core/components/TextField'
import type { NoteField } from '../../../../domain/notes/entity/errors/NoteValidationError'
import { NOTE_DESCRIPTION_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from '../../../../domain/notes/entity/models/Note'
import styles from './NoteFormFields.module.css'

/**
 * Props of NoteFormFields
 */
type NoteFormFieldsProps = {
  /** Current value of the title */
  title: string
  /** Current value of the description */
  description: string
  /** Message to show to the user, null when there is no error */
  error: string | null
  /** Field to highlight, null when the error is not about a specific field */
  invalidField: NoteField | null
  /** True while the note is being sent */
  isSubmitting: boolean
  /** Text of the submit button */
  submitLabel: string
  /** Text of the submit button while the note is being sent */
  submittingLabel: string
  /** Called on every change of the title, with the new value */
  onTitleChange: (value: string) => void
  /** Called on every change of the description, with the new value */
  onDescriptionChange: (value: string) => void
  /** Called when the user submits the form */
  onSubmit: () => void
  /** Called when the user gives up; the cancel button is only shown when this is set */
  onCancel?: () => void
  /** Additional fields, shown after the description */
  extraFields?: ReactNode
  /** True when the title is the main field of the page */
  prominentTitle?: boolean
}

/**
 * Form of a note (title + description + actions), shared by the creation and the edition
 * @param props - Values of the form, its state and what to do on each action
 * @returns The form
 */
export function NoteFormFields({
  title,
  description,
  error,
  invalidField,
  isSubmitting,
  submitLabel,
  submittingLabel,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
  extraFields,
  prominentTitle = false,
}: NoteFormFieldsProps): JSX.Element {
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Titre"
        value={title}
        onChange={onTitleChange}
        maxLength={NOTE_TITLE_MAX_LENGTH}
        placeholder="Une idée en quelques mots"
        invalid={invalidField === 'title'}
        prominent={prominentTitle}
      />
      <TextField
        label="Description"
        hint="· facultative"
        value={description}
        onChange={onDescriptionChange}
        maxLength={NOTE_DESCRIPTION_MAX_LENGTH}
        placeholder="Développe l'idée, ajoute du contexte…"
        invalid={invalidField === 'description'}
        multiline
      />
      {extraFields}
      {error !== null && <ErrorMessage>{error}</ErrorMessage>}
      <div className={styles.actions}>
        {onCancel !== undefined && (
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}
