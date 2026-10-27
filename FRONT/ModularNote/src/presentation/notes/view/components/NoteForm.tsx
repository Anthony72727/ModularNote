import type { FormEvent, JSX } from 'react'
import { Button } from '../../../core/components/Button'
import { ErrorMessage } from '../../../core/components/ErrorMessage'
import { TextField } from '../../../core/components/TextField'
import { NOTE_DESCRIPTION_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from '../../../../domain/notes/entity/models/Note'
import type { AddNoteViewModel } from '../../viewModel/useAddNoteViewModel'
import { useAddNoteViewModel } from '../../viewModel/useAddNoteViewModel'
import styles from './NoteForm.module.css'

/**
 * Full creation form of a note (title + description)
 * @returns The form
 */
export function NoteForm(): JSX.Element {
  const viewModel: AddNoteViewModel = useAddNoteViewModel()

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    viewModel.submit()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Titre"
        value={viewModel.title}
        onChange={viewModel.changeTitle}
        maxLength={NOTE_TITLE_MAX_LENGTH}
        placeholder="Une idée en quelques mots"
        invalid={viewModel.invalidField === 'title'}
      />
      <TextField
        label="Description"
        hint="(facultative)"
        value={viewModel.description}
        onChange={viewModel.changeDescription}
        maxLength={NOTE_DESCRIPTION_MAX_LENGTH}
        placeholder="Détaille ton idée…"
        invalid={viewModel.invalidField === 'description'}
        multiline
      />
      {viewModel.error !== null && <ErrorMessage>{viewModel.error}</ErrorMessage>}
      <Button type="submit" disabled={viewModel.isSubmitting}>
        {viewModel.isSubmitting ? 'Création…' : "Créer l'idée"}
      </Button>
    </form>
  )
}
