import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { QueryClient, UseMutationResult } from '@tanstack/react-query'
import type { Dependencies } from '../../../core/di/Dependencies'
import { useDependencies } from '../../../core/di/DependenciesContext'
import { NoteNotFoundError } from '../../../domain/notes/entity/errors/NoteNotFoundError'
import { NoteValidationError } from '../../../domain/notes/entity/errors/NoteValidationError'
import type { NoteField } from '../../../domain/notes/entity/errors/NoteValidationError'
import type { Note } from '../../../domain/notes/entity/models/Note'
import { toNoteErrorMessage } from '../util/toNoteErrorMessage'
import { noteQueryKeys } from './noteQueryKeys'

/**
 * State and actions of the note edition form
 */
export type UpdateNoteViewModel = {
  /** Title typed by the user, as is */
  title: string
  /** Description typed by the user, as is */
  description: string
  /** Message to show to the user, null when there is no error */
  error: string | null
  /** Field to highlight, null when the error is not about a specific field */
  invalidField: NoteField | null
  /** True while the modifications are being sent */
  isSubmitting: boolean
  /** Replace the title and clear the current error (receives the new title) */
  changeTitle: (value: string) => void
  /** Replace the description and clear the current error (receives the new description) */
  changeDescription: (value: string) => void
  /** Validate and send the modifications; ignored while they are already being sent */
  submit: () => void
}

/**
 * Raw values of the form, validated by the use case
 */
type UpdateNoteInput = {
  title: string
  description: string
}

/**
 * ViewModel of the note edition form, prefilled with the note when it opens
 * @param note - Note to modify
 * @param onSaved - Called once the modifications are saved
 * @returns The state of the form and the actions the view can call
 */
export function useUpdateNoteViewModel(note: Note, onSaved: () => void): UpdateNoteViewModel {
  const { updateNote }: Dependencies = useDependencies()
  const queryClient: QueryClient = useQueryClient()
  const [title, setTitle] = useState<string>(note.title)
  const [description, setDescription] = useState<string>(note.description ?? '')

  const updateNoteMutation: UseMutationResult<Note, Error, UpdateNoteInput> = useMutation({
    mutationFn: (input: UpdateNoteInput): Promise<Note> => updateNote.execute(note.id, input.title, input.description),
    onSuccess: (saved: Note): void => {
      // Every component that reads the notes from the cache is refreshed, without reloading the page
      queryClient.setQueryData<Note[]>(noteQueryKeys.all, (notes: Note[] | undefined): Note[] | undefined =>
        notes?.map((current: Note): Note => (current.id === saved.id ? saved : current)),
      )
      queryClient.setQueryData<Note>(noteQueryKeys.detail(saved.id), saved)
    },
    onError: (error: Error): void => {
      if (error instanceof NoteNotFoundError) {
        // The note was deleted elsewhere: the list must stop showing it
        void queryClient.invalidateQueries({ queryKey: noteQueryKeys.all })
      }
    },
  })

  function clearError(): void {
    if (updateNoteMutation.isError) {
      updateNoteMutation.reset()
    }
  }

  function changeTitle(value: string): void {
    setTitle(value)
    clearError()
  }

  function changeDescription(value: string): void {
    setDescription(value)
    clearError()
  }

  function submit(): void {
    if (updateNoteMutation.isPending) {
      return
    }
    updateNoteMutation.mutate({ title, description }, { onSuccess: (): void => onSaved() })
  }

  return {
    title,
    description,
    error: updateNoteMutation.isError ? toNoteErrorMessage(updateNoteMutation.error) : null,
    invalidField: updateNoteMutation.error instanceof NoteValidationError ? updateNoteMutation.error.field : null,
    isSubmitting: updateNoteMutation.isPending,
    changeTitle,
    changeDescription,
    submit,
  }
}
