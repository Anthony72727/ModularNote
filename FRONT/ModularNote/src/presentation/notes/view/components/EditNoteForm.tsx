import type { JSX } from 'react'
import type { Note } from '../../../../domain/notes/entity/models/Note'
import type { UpdateNoteViewModel } from '../../viewModel/useUpdateNoteViewModel'
import { useUpdateNoteViewModel } from '../../viewModel/useUpdateNoteViewModel'
import { NoteFormFields } from './NoteFormFields'

/**
 * Props of EditNoteForm
 */
type EditNoteFormProps = {
  /** Note to modify */
  note: Note
  /** Called once the modifications are saved */
  onSaved: () => void
  /** Called when the user gives up: nothing is saved */
  onCancel: () => void
}

/**
 * Edition form of a note, prefilled with its current values
 * @param props - The note to modify and what to do when the edition ends
 * @returns The form
 */
export function EditNoteForm({ note, onSaved, onCancel }: EditNoteFormProps): JSX.Element {
  const viewModel: UpdateNoteViewModel = useUpdateNoteViewModel(note, onSaved)

  return (
    <NoteFormFields
      title={viewModel.title}
      description={viewModel.description}
      error={viewModel.error}
      invalidField={viewModel.invalidField}
      isSubmitting={viewModel.isSubmitting}
      submitLabel="Enregistrer"
      submittingLabel="Enregistrement…"
      onTitleChange={viewModel.changeTitle}
      onDescriptionChange={viewModel.changeDescription}
      onSubmit={viewModel.submit}
      onCancel={onCancel}
    />
  )
}
