import { useEffect } from 'react'
import type { JSX } from 'react'
import { useUnsavedChanges } from '../../../core/unsavedChanges/UnsavedChangesContext'
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
  /** Called when the form starts or stops holding unsaved modifications, with the new state */
  onUnsavedChange: (hasUnsavedChanges: boolean) => void
}

/**
 * Edition form of a note, prefilled with its current values
 * @param props - The note to modify and what to do when the edition ends
 * @returns The form
 */
export function EditNoteForm({ note, onSaved, onCancel, onUnsavedChange }: EditNoteFormProps): JSX.Element {
  const viewModel: UpdateNoteViewModel = useUpdateNoteViewModel(note, onSaved)
  useUnsavedChanges(viewModel.hasUnsavedChanges)

  useEffect((): (() => void) => {
    onUnsavedChange(viewModel.hasUnsavedChanges)
    return (): void => onUnsavedChange(false)
  }, [viewModel.hasUnsavedChanges, onUnsavedChange])

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
