import type { JSX } from 'react'
import type { AddNoteViewModel } from '../../viewModel/useAddNoteViewModel'
import { useAddNoteViewModel } from '../../viewModel/useAddNoteViewModel'
import { NoteFormFields } from './NoteFormFields'

/**
 * Full creation form of a note (title + description)
 * @returns The form
 */
export function NoteForm(): JSX.Element {
  const viewModel: AddNoteViewModel = useAddNoteViewModel()

  return (
    <NoteFormFields
      title={viewModel.title}
      description={viewModel.description}
      error={viewModel.error}
      invalidField={viewModel.invalidField}
      isSubmitting={viewModel.isSubmitting}
      submitLabel="Créer l'idée"
      submittingLabel="Création…"
      onTitleChange={viewModel.changeTitle}
      onDescriptionChange={viewModel.changeDescription}
      onSubmit={viewModel.submit}
    />
  )
}
