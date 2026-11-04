import type { JSX } from 'react'
import { useUnsavedChanges } from '../../../core/unsavedChanges/UnsavedChangesContext'
import type { AddNoteViewModel } from '../../viewModel/useAddNoteViewModel'
import { useAddNoteViewModel } from '../../viewModel/useAddNoteViewModel'
import { LinkedNotesField } from './LinkedNotesField'
import { NoteFormFields } from './NoteFormFields'

/**
 * Props of NoteForm
 */
type NoteFormProps = {
  /** Called once the note is saved */
  onCreated: () => void
  /** Called when the user gives up */
  onCancel: () => void
}

/**
 * Full creation form of a note (title + description + linked notes)
 * @param props - What to do once the note is saved, or when the user gives up
 * @returns The form
 */
export function NoteForm({ onCreated, onCancel }: NoteFormProps): JSX.Element {
  const viewModel: AddNoteViewModel = useAddNoteViewModel(onCreated)
  useUnsavedChanges(viewModel.hasUnsavedInput)

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
      onCancel={onCancel}
      prominentTitle
      extraFields={
        <LinkedNotesField
          linkedNotes={viewModel.linkedNotes}
          onAdd={viewModel.addLinkedNote}
          onRemove={viewModel.removeLinkedNote}
        />
      }
    />
  )
}
